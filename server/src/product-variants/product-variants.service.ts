import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';

import { ProductsService } from '../products/products.service';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly productVariantsRepository: Repository<ProductVariant>,

    private readonly productsService: ProductsService,
  ) {}

  async create(productId: string, dto: CreateProductVariantDto) {
    // 1. Find the product
    const product = await this.productsService.findOne(productId);

    // 2. Check whether SKU already exists
    const existingVariant = await this.productVariantsRepository.findOne({
      where: {
        sku: dto.sku,
      },
    });

    if (existingVariant) {
      throw new ConflictException('Product variant SKU already exists');
    }

    // 3. Create variant
    const variant = this.productVariantsRepository.create({
      product,
      sku: dto.sku,
      size: dto.size ?? null,
      color: dto.color ?? null,
      price: dto.price?.toString() ?? null,
      stockQuantity: dto.stockQuantity ?? 0,
      isActive: true,
    });

    // 4. Save variant
    return this.productVariantsRepository.save(variant);
  }

  async findByProduct(productId: string) {
    // 1. Make sure the product exists
    await this.productsService.findOne(productId);

    // 2. Get all variants belonging to the product
    return this.productVariantsRepository.find({
      where: {
        product: {
          id: productId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(productId: string, variantId: string) {
    // Make sure the product exists
    await this.productsService.findOne(productId);

    // Find the variant belonging to this product
    const variant = await this.productVariantsRepository.findOne({
      where: {
        id: variantId,
        product: {
          id: productId,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  async update(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ) {
    // 1. Find the product
    await this.productsService.findOne(productId);

    // 2. Find the variant belonging to this product
    const variant = await this.productVariantsRepository.findOne({
      where: {
        id: variantId,
        product: {
          id: productId,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // 3. Check duplicate SKU
    if (dto.sku && dto.sku !== variant.sku) {
      const existingVariant = await this.productVariantsRepository.findOne({
        where: {
          sku: dto.sku,
        },
      });

      if (existingVariant) {
        throw new ConflictException('Product variant SKU already exists');
      }
    }

    // 4. Update only supplied fields
    if (dto.sku !== undefined) {
      variant.sku = dto.sku;
    }

    if (dto.size !== undefined) {
      variant.size = dto.size;
    }

    if (dto.color !== undefined) {
      variant.color = dto.color;
    }

    if (dto.price !== undefined) {
      variant.price = dto.price.toString();
    }

    if (dto.stockQuantity !== undefined) {
      variant.stockQuantity = dto.stockQuantity;
    }

    if (dto.isActive !== undefined) {
      variant.isActive = dto.isActive;
    }

    // 5. Save changes
    return this.productVariantsRepository.save(variant);
  }

  async remove(productId: string, variantId: string) {
    await this.productsService.findOne(productId);

    const variant = await this.productVariantsRepository.findOne({
      where: {
        id: variantId,
        product: {
          id: productId,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    await this.productVariantsRepository.remove(variant);

    return {
      id: variantId,
      deleted: true,
    };
  }

  async save(variant: ProductVariant) {
    return this.productVariantsRepository.save(variant);
  }
}
