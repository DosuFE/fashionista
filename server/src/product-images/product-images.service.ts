import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ProductImage } from './entities/product-image.entity';

import { ProductsService } from '../products/products.service';

import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly productsService: ProductsService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    productId: string,
    createProductImageDto: CreateProductImageDto,
  ) {
    const product = await this.productsService.findOne(productId);

    const image = this.productImagesRepository.create({
      imageUrl: createProductImageDto.imageUrl,

      altText: createProductImageDto.altText ?? null,

      isPrimary: createProductImageDto.isPrimary ?? false,

      sortOrder: createProductImageDto.sortOrder ?? 0,

      product,
    });

    return this.productImagesRepository.save(image);
  }

  async findByProduct(productId: string) {
    await this.productsService.findOne(productId);

    return this.productImagesRepository.find({
      where: {
        product: {
          id: productId,
        },
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async remove(productId: string, imageId: string) {
    const image = await this.productImagesRepository.findOne({
      where: {
        id: imageId,
        product: {
          id: productId,
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    await this.productImagesRepository.remove(image);

    return {
      id: imageId,
      deleted: true,
    };
  }

  async upload(productId: string, file: Express.Multer.File, altText?: string) {
    const product = await this.productsService.findOne(productId);

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const uploadedImage = await this.cloudinaryService.uploadImage(file);

    const image = this.productImagesRepository.create({
      product,

      imageUrl: uploadedImage.secure_url,

      altText: altText ?? null,

      isPrimary: false,

      sortOrder: 0,
    });

    return this.productImagesRepository.save(image);
  }
}
