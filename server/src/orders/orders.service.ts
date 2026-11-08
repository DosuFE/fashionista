import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';

import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { CancellationRequestStatus } from './enums/cancellation-request-status.enum';
// import { PaymentAttemptStatus } from '../payment/enums/payment.enum';

import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  CancellationReviewDecision,
  ReviewCancellationDto,
} from './dto/review-cancellation.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  private async restoreOrderInventory(
    manager: EntityManager,
    order: Order,
  ): Promise<void> {
    // Older orders may not have deducted stock.
    if (!order.inventoryDeducted || order.inventoryRestored) {
      return;
    }

    const orderItems = await manager.find(OrderItem, {
      where: {
        order: { id: order.id },
      },
      relations: {
        product: true,
        variant: true,
      },
    });

    for (const item of orderItems) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestException(
          'Cannot restore inventory for an invalid order item quantity',
        );
      }

      if (item.variant) {
        // Restore stock to the exact variant purchased.
        const variant = await manager.findOne(ProductVariant, {
          where: {
            id: item.variant.id,
            product: { id: item.product.id },
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant) {
          throw new NotFoundException(
            `Variant for ${item.productName} was not found`,
          );
        }

        variant.stockQuantity += item.quantity;

        await manager.save(ProductVariant, variant);
      } else {
        // Restore stock for a product without a variant.
        const product = await manager.findOne(Product, {
          where: { id: item.product.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            `Product ${item.productName} was not found`,
          );
        }

        product.stockQuantity += item.quantity;

        await manager.save(Product, product);
      }
    }

    // The caller saves this flag with the order status in the same database transaction.
    order.inventoryRestored = true;
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    return this.orderRepository.manager.transaction(async (manager) => {
      // 1. Lock the customer's cart during checkout.
      const cart = await manager.findOne(Cart, {
        where: {
          user: { id: userId },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // 2. Load the items currently in the cart.
      const cartItems = await manager.find(CartItem, {
        where: {
          cart: { id: cart.id },
        },
        relations: {
          product: true,
          variant: true,
        },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException(
          'Cannot create an order from an empty cart',
        );
      }

      let subtotal = 0;

      const preparedItems: {
        cartItem: CartItem;
        product: Product;
        variant: ProductVariant | null;
        unitPrice: number;
        itemSubtotal: number;
      }[] = [];

      // 3. Lock and validate inventory before creating the order.
      for (const cartItem of cartItems) {
        if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
          throw new BadRequestException(
            'Cart contains an invalid item quantity',
          );
        }

        // Lock the parent product.
        const product = await manager.findOne(Product, {
          where: { id: cartItem.product.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            'A product in your cart no longer exists',
          );
        }

        if (!product.isActive) {
          throw new ConflictException(`${product.name} is no longer available`);
        }

        let variant: ProductVariant | null = null;
        let unitPrice: number;

        if (cartItem.variant) {
          // Variant purchases use variant stock, not product stock.
          variant = await manager.findOne(ProductVariant, {
            where: {
              id: cartItem.variant.id,
              product: { id: product.id },
            },
            lock: { mode: 'pessimistic_write' },
          });

          if (!variant) {
            throw new NotFoundException(
              `The selected variant of ${product.name} no longer exists`,
            );
          }

          if (!variant.isActive) {
            throw new ConflictException(
              `The selected variant of ${product.name} is unavailable`,
            );
          }

          if (variant.stockQuantity < cartItem.quantity) {
            throw new ConflictException(
              `Insufficient stock for ${product.name} (SKU: ${variant.sku}). Available: ${variant.stockQuantity}`,
            );
          }

          unitPrice =
            variant.price !== null
              ? Number(variant.price)
              : Number(product.discountPrice ?? product.price);

          if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            throw new BadRequestException(`Invalid price for ${product.name}`);
          }

          variant.stockQuantity -= cartItem.quantity;
          await manager.save(ProductVariant, variant);
        } else {
          // Simple products use product-level stock.
          if (product.stockQuantity < cartItem.quantity) {
            throw new ConflictException(
              `Insufficient stock for ${product.name} (SKU: ${product.sku}). Available: ${product.stockQuantity}`,
            );
          }

          unitPrice = Number(product.discountPrice ?? product.price);

          if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            throw new BadRequestException(`Invalid price for ${product.name}`);
          }

          product.stockQuantity -= cartItem.quantity;
          await manager.save(Product, product);
        }

        const itemSubtotal = unitPrice * cartItem.quantity;

        subtotal += itemSubtotal;

        preparedItems.push({
          cartItem,
          product,
          variant,
          unitPrice,
          itemSubtotal,
        });
      }

      // 4. Prepare the order after inventory validation.
      const shippingFee = 0;
      const discount = 0;
      const total = subtotal + shippingFee - discount;

      const orderNumber = `ORD-${Date.now()}`;

      const order = manager.create(Order, {
        user: { id: userId },
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        shippingAddress: createOrderDto.shippingAddress,
        notes: createOrderDto.notes ?? null,

        // These fields are added in the inventory-tracking migration.
        inventoryDeducted: true,
        inventoryRestored: false,
      });

      const savedOrder = await manager.save(Order, order);

      // 5. Save every order item in the same transaction.
      const items = preparedItems.map((item) =>
        manager.create(OrderItem, {
          order: savedOrder,
          product: { id: item.product.id },
          variant: item.variant ? { id: item.variant.id } : null,
          productName: item.product.name,
          sku: item.variant ? item.variant.sku : item.product.sku,
          quantity: item.cartItem.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          subtotal: item.itemSubtotal.toFixed(2),
        }),
      );

      const savedItems = await manager.save(OrderItem, items);

      // 6. Clear the cart only after all previous operations succeed.
      await manager.delete(
        CartItem,
        cartItems.map((item) => item.id),
      );

      // The transaction commits only after the callback completes.
      return {
        id: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        status: savedOrder.status,
        paymentStatus: savedOrder.paymentStatus,
        subtotal: savedOrder.subtotal,
        shippingFee: savedOrder.shippingFee,
        discount: savedOrder.discount,
        total: savedOrder.total,
        shippingAddress: savedOrder.shippingAddress,
        notes: savedOrder.notes,
        items: savedItems.map((item) => ({
          id: item.id,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
        createdAt: savedOrder.createdAt,
      };
    });
  }

  async findAllOrdersForAdmin() {
    const orders = await this.orderRepository.find({
      relations: {
        items: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      createdAt: order.createdAt,
      cancellationReason: order.cancellationReason,
      cancellationRequestStatus: order.cancellationRequestStatus,
      cancellationRequestedAt: order.cancellationRequestedAt,
      cancellationReviewedAt: order.cancellationReviewedAt,
      cancellationReviewNote: order.cancellationReviewNote,
    }));
  }

  async findOrderByIdForAdmin(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      createdAt: order.createdAt,
      cancellationReason: order.cancellationReason,
      cancellationRequestStatus: order.cancellationRequestStatus,
      cancellationRequestedAt: order.cancellationRequestedAt,
      cancellationReviewedAt: order.cancellationReviewedAt,
      cancellationReviewNote: order.cancellationReviewNote,
    };
  }

  async findUserOrders(userId: string) {
    const orders = await this.orderRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        items: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      createdAt: order.createdAt,
    }));
  }

  async findUserOrderById(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user: {
          id: userId,
        },
      },
      relations: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async cancelOrder(userId: string, orderId: string, dto: CancelOrderDto) {
    return this.orderRepository.manager.transaction(async (manager) => {
      // Lock the order so two cancellation requests cannot process it
      // simultaneously.
      const order = await manager.findOne(Order, {
        where: {
          id: orderId,
          user: { id: userId },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new ConflictException('Order is already cancelled');
      }

      if (
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException('This order can no longer be cancelled');
      }

      if (
        order.cancellationRequestStatus === CancellationRequestStatus.PENDING
      ) {
        throw new ConflictException(
          'A cancellation request is already pending',
        );
      }

      // PROCESSING orders require staff approval.
      // Do not restore stock until staff approves the request.
      if (order.status === OrderStatus.PROCESSING) {
        order.cancellationReason = dto.reason ?? null;
        order.cancellationRequestStatus = CancellationRequestStatus.PENDING;
        order.cancellationRequestedAt = new Date();
        order.cancellationReviewedAt = null;
        order.cancellationReviewNote = null;

        const savedOrder = await manager.save(Order, order);

        return {
          message: 'Cancellation request submitted for staff review',
          order: savedOrder,
        };
      }

      // PENDING and CONFIRMED orders can be cancelled directly.
      if (
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.CONFIRMED
      ) {
        order.status = OrderStatus.CANCELLED;
        order.cancellationReason = dto.reason ?? null;
        order.cancellationRequestedAt = new Date();
        order.cancellationRequestStatus = null;
        order.cancellationReviewedAt = null;
        order.cancellationReviewNote = null;

        // Restore stock only if this order deducted it
        // and the stock has not already been restored.
        await this.restoreOrderInventory(manager, order);

        // Save cancellation and inventoryRestored together.
        const savedOrder = await manager.save(Order, order);

        return {
          message: 'Order cancelled successfully',
          order: savedOrder,
        };
      }

      throw new BadRequestException(
        'This order cannot be cancelled in its current status',
      );
    });
  }

  async reviewCancellation(orderId: string, dto: ReviewCancellationDto) {
    return this.orderRepository.manager.transaction(async (manager) => {
      // Lock the order to prevent simultaneous staff reviews.
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Only a PROCESSING order with a pending request can be reviewed.
      if (
        order.status !== OrderStatus.PROCESSING ||
        order.cancellationRequestStatus !== CancellationRequestStatus.PENDING
      ) {
        throw new ConflictException(
          'This order has no pending cancellation request',
        );
      }

      order.cancellationReviewedAt = new Date();
      order.cancellationReviewNote = dto.reviewNote ?? null;

      if (dto.decision === CancellationReviewDecision.APPROVED) {
        // Restore inventory before saving the approved cancellation.
        // The helper prevents stock from being restored twice.
        await this.restoreOrderInventory(manager, order);

        order.status = OrderStatus.CANCELLED;
        order.cancellationRequestStatus = CancellationRequestStatus.APPROVED;
      } else if (dto.decision === CancellationReviewDecision.REJECTED) {
        // Rejection does not restore inventory.
        order.cancellationRequestStatus = CancellationRequestStatus.REJECTED;
      } else {
        throw new BadRequestException('Invalid cancellation review decision');
      }

      const savedOrder = await manager.save(Order, order);

      return {
        message:
          dto.decision === CancellationReviewDecision.APPROVED
            ? 'Cancellation approved successfully'
            : 'Cancellation request rejected',
        order: savedOrder,
      };
    });
  }

  async findPendingCancellationRequests() {
    return this.orderRepository.find({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        cancellationReason: true,
        cancellationRequestStatus: true,
        cancellationRequestedAt: true,
        createdAt: true,
      },
      where: {
        status: OrderStatus.PROCESSING,
        cancellationRequestStatus: CancellationRequestStatus.PENDING,
      },
      order: {
        cancellationRequestedAt: 'ASC',
      },
    });
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    return this.orderRepository.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === newStatus) {
        throw new ConflictException(`Order is already ${newStatus}`);
      }

      // A cancelled or delivered order cannot be changed again.
      if (
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.DELIVERED
      ) {
        throw new ConflictException(
          'This order cannot be updated from its current status',
        );
      }

      // A pending cancellation must be reviewed before fulfillment continues.
      if (
        order.cancellationRequestStatus === CancellationRequestStatus.PENDING
      ) {
        throw new ConflictException(
          'Review the pending cancellation request before updating this order',
        );
      }

      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [
          OrderStatus.PROCESSING,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
      };

      if (!allowedTransitions[order.status].includes(newStatus)) {
        throw new BadRequestException(
          `Cannot change order status from ${order.status} to ${newStatus}`,
        );
      }

      // Orders must be paid before they enter fulfillment.
      if (
        newStatus === OrderStatus.PROCESSING &&
        order.paymentStatus !== PaymentStatus.PAID
      ) {
        throw new ConflictException(
          'Only successfully paid orders can enter processing',
        );
      }

      order.status = newStatus;

      const updatedOrder = await manager.save(Order, order);

      return {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        updatedAt: updatedOrder.updatedAt,
      };
    });
  }
}
