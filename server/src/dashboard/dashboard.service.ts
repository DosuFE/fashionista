import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { PaymentStatus } from '../orders/enums/payment-status.enum';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async getOverview() {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      revenueResult,
    ] = await Promise.all([
      this.orderRepository.count(),

      this.orderRepository.count({
        where: { status: OrderStatus.PENDING },
      }),

      this.orderRepository.count({
        where: { status: OrderStatus.PROCESSING },
      }),

      this.orderRepository.count({
        where: { status: OrderStatus.SHIPPED },
      }),

      this.orderRepository.count({
        where: { status: OrderStatus.DELIVERED },
      }),

      this.orderRepository.count({
        where: { status: OrderStatus.CANCELLED },
      }),

      this.userRepository.count({
        where: { role: UserRole.CUSTOMER },
      }),

      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.total), 0)', 'revenue')
        .where('order.paymentStatus = :paymentStatus', {
          paymentStatus: PaymentStatus.PAID,
        })
        .andWhere('order.status != :cancelledStatus', {
          cancelledStatus: OrderStatus.CANCELLED,
        })
        .getRawOne(),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalRevenue: Number(revenueResult?.revenue ?? 0),
    };
  }

  async getRecentOrders() {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC')
      .take(5)
      .getMany();

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        firstName: order.user?.firstName ?? '',
        lastName: order.user?.lastName ?? '',
        email: order.user?.email ?? '',
      },
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    }));
  }

  async getLowStockAlerts(threshold: number = 5) {
    const [products, variants] = await Promise.all([
      this.productRepository
        .createQueryBuilder('product')
        .where('product.isActive = :isActive', {
          isActive: true,
        })
        .andWhere('product.stockQuantity <= :threshold', {
          threshold,
        })
        .orderBy('product.stockQuantity', 'ASC')
        .getMany(),

      this.productVariantRepository
        .createQueryBuilder('variant')
        .leftJoinAndSelect('variant.product', 'product')
        .where('variant.isActive = :isActive', {
          isActive: true,
        })
        .andWhere('variant.stockQuantity <= :threshold', {
          threshold,
        })
        .andWhere('product.isActive = :productActive', {
          productActive: true,
        })
        .orderBy('variant.stockQuantity', 'ASC')
        .getMany(),
    ]);

    return {
      threshold,

      totalLowStockProducts: products.length,
      totalLowStockVariants: variants.length,
      totalAlerts: products.length + variants.length,

      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
      })),

      variants: variants.map((variant) => ({
        id: variant.id,
        productId: variant.product.id,
        productName: variant.product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        stockQuantity: variant.stockQuantity,
        isActive: variant.isActive,
      })),
    };
  }
}
