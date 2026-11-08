import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../products/entities/product.entity';

import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findOrCreateWishlist(userId: string) {
    let wishlist = await this.wishlistRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: {
          id: userId,
        },
      });

      wishlist = await this.wishlistRepository.save(wishlist);
    }

    return wishlist;
  }

  async getWishlist(userId: string) {
    const wishlist = await this.findOrCreateWishlist(userId);

    const items = await this.wishlistItemRepository.find({
      where: {
        wishlist: {
          id: wishlist.id,
        },
      },
      relations: {
        product: {
          images: true,
          category: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      id: wishlist.id,

      items: items.map((item) => ({
        id: item.id,

        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          isActive: item.product.isActive,
        },
      })),

      totalItems: items.length,
    };
  }

  async addItem(userId: string, productId: string) {
    const wishlist = await this.findOrCreateWishlist(userId);

    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new ConflictException('This product is not available');
    }

    const existingItem = await this.wishlistItemRepository.findOne({
      where: {
        wishlist: { id: wishlist.id },
        product: { id: product.id },
      },
    });

    if (existingItem) {
      throw new ConflictException('Product is already in your wishlist');
    }

    const wishlistItem = this.wishlistItemRepository.create({
      wishlist,
      product,
    });

    const savedItem = await this.wishlistItemRepository.save(wishlistItem);

    return {
      id: savedItem.id,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        isActive: product.isActive,
      },
    };
  }

  async deleteItem(userId: string, itemId: string) {
  const wishlistItem =
    await this.wishlistItemRepository.findOne({
      where: {
        id: itemId,
        wishlist: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        wishlist: true,
      },
    });

  if (!wishlistItem) {
    throw new NotFoundException(
      'Wishlist item not found',
    );
  }

  await this.wishlistItemRepository.remove(
    wishlistItem,
  );

  return {
    id: itemId,
    deleted: true,
  };
}
}
