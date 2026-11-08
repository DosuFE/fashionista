import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        items: {
          product: true,
          variant: true,
        },
      },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: {
          id: userId,
        },
      });

      await this.cartRepository.save(cart);

      return {
        id: cart.id,
        items: [],
        totalItems: 0,
        subtotal: '0.00',
      };
    }

    const items = cart.items.map((item) => {
      const unitPrice =
        item.variant?.price ?? item.product.discountPrice ?? item.product.price;

      const subtotal = Number(unitPrice) * item.quantity;

      return {
        id: item.id,

        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
        },

        variant: item.variant
          ? {
              id: item.variant.id,
              sku: item.variant.sku,
              size: item.variant.size,
              color: item.variant.color,
              price: item.variant.price,
            }
          : null,

        quantity: item.quantity,

        unitPrice,

        subtotal: subtotal.toFixed(2),
      };
    });

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const subtotal = items.reduce(
      (total, item) => total + Number(item.subtotal),
      0,
    );

    return {
      id: cart.id,
      items,
      totalItems,
      subtotal: subtotal.toFixed(2),
    };
  }

  private async findOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: {
          id: userId,
        },
      });

      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.findOrCreateCart(userId);

    const product = await this.productRepository.findOne({
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not active');
    }

    let variant: ProductVariant | null = null;

    if (dto.variantId) {
      variant = await this.productVariantRepository.findOne({
        where: {
          id: dto.variantId,
        },
        relations: {
          product: true,
        },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }

      if (variant.product.id !== product.id) {
        throw new BadRequestException(
          'Product variant does not belong to this product',
        );
      }

      if (!variant.isActive) {
        throw new BadRequestException('Product variant is not active');
      }
    }

    const availableStock = variant
      ? variant.stockQuantity
      : product.stockQuantity;

    if (dto.quantity > availableStock) {
      throw new BadRequestException('Insufficient stock');
    }

    let cartItem: CartItem | null;

    if (variant) {
      cartItem = await this.cartItemRepository.findOne({
        where: {
          cart: {
            id: cart.id,
          },
          product: {
            id: product.id,
          },
          variant: {
            id: variant.id,
          },
        },
      });
    } else {
      cartItem = await this.cartItemRepository
        .createQueryBuilder('cartItem')
        .leftJoin('cartItem.cart', 'cart')
        .leftJoin('cartItem.product', 'product')
        .where('cart.id = :cartId', {
          cartId: cart.id,
        })
        .andWhere('product.id = :productId', {
          productId: product.id,
        })
        .andWhere('cartItem.variant_id IS NULL')
        .getOne();
    }

    if (cartItem) {
      const newQuantity = cartItem.quantity + dto.quantity;

      if (newQuantity > availableStock) {
        throw new BadRequestException('Insufficient stock');
      }

      cartItem.quantity = newQuantity;

      cartItem = await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        variant,
        quantity: dto.quantity,
      });

      cartItem = await this.cartItemRepository.save(cartItem);
    }

    const unitPrice = variant?.price ?? product.discountPrice ?? product.price;

    return {
      id: cartItem.id,

      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
      },

      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
          }
        : null,

      quantity: cartItem.quantity,

      unitPrice,
    };
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        product: true,
        variant: {
          product: true,
        },
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const availableStock = cartItem.variant
      ? cartItem.variant.stockQuantity
      : cartItem.product.stockQuantity;

    if (dto.quantity > availableStock) {
      throw new BadRequestException('Insufficient stock');
    }

    cartItem.quantity = dto.quantity;

    const updatedCartItem = await this.cartItemRepository.save(cartItem);

    const unitPrice =
      cartItem.variant?.price ??
      cartItem.product.discountPrice ??
      cartItem.product.price;

    return {
      id: updatedCartItem.id,

      product: {
        id: cartItem.product.id,
        name: cartItem.product.name,
        slug: cartItem.product.slug,
      },

      variant: cartItem.variant
        ? {
            id: cartItem.variant.id,
            sku: cartItem.variant.sku,
            size: cartItem.variant.size,
            color: cartItem.variant.color,
            price: cartItem.variant.price,
          }
        : null,

      quantity: updatedCartItem.quantity,

      unitPrice,
    };
  }

  async deleteItem(userId: string, itemId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    return {
      id: itemId,
      deleted: true,
    };
  }
}
