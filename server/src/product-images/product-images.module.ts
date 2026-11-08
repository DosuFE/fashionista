import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductImage } from './entities/product-image.entity';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { CloudinaryService } from './cloudinary.service';

import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage]), ProductsModule],

  controllers: [ProductImagesController],

  providers: [ProductImagesService, CloudinaryService],
})
export class ProductImagesModule {}
