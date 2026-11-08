import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';

import { CategoriesService } from '../categories/categories.service';

import { CreateProductDto } from './dto/create-product.dto';

import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // 1. Find the category
    const category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );

    // 2. Check if slug already exists
    const existingSlug = await this.productsRepository.findOne({
      where: {
        slug: createProductDto.slug,
      },
    });

    if (existingSlug) {
      throw new ConflictException('Product slug already exists');
    }

    // 3. Check if SKU already exists
    const existingSku = await this.productsRepository.findOne({
      where: {
        sku: createProductDto.sku,
      },
    });

    if (existingSku) {
      throw new ConflictException('Product SKU already exists');
    }

    // 4. Create product
    const product = this.productsRepository.create({
      name: createProductDto.name,
      slug: createProductDto.slug,
      description: createProductDto.description ?? null,
      price: String(createProductDto.price),
      discountPrice:
        createProductDto.discountPrice === undefined
          ? null
          : String(createProductDto.discountPrice),
      sku: createProductDto.sku,
      stockQuantity: createProductDto.stockQuantity ?? 0,
      category,
    });

    // 5. Save product
    return this.productsRepository.save(product);
  }

  async findAll() {
    return this.productsRepository.find({
      relations: {
        category: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    // If categoryId is being changed,
    // find the new Category entity.
    if (
      updateProductDto.categoryId &&
      updateProductDto.categoryId !== product.category.id
    ) {
      const category = await this.categoriesService.findOne(
        updateProductDto.categoryId,
      );

      product.category = category;
    }

    // Check slug uniqueness
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingSlug = await this.productsRepository.findOne({
        where: {
          slug: updateProductDto.slug,
        },
      });

      if (existingSlug) {
        throw new ConflictException('Product slug already exists');
      }
    }

    // Check SKU uniqueness
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productsRepository.findOne({
        where: {
          sku: updateProductDto.sku,
        },
      });

      if (existingSku) {
        throw new ConflictException('Product SKU already exists');
      }
    }

    // Remove categoryId because
    // Product uses the category relation.
    const { categoryId, ...productData } = updateProductDto;

    // Update remaining fields
    Object.assign(product, productData);

    return this.productsRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productsRepository.remove(product);

    return {
      id,
      deleted: true,
    };
  }

  async save(product: Product) {
    return this.productsRepository.save(product);
  }
}
