import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { ProductImagesService } from './product-images.service';

import { CreateProductImageDto } from './dto/create-product-image.dto';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  async create(
    @Param('productId')
    productId: string,

    @Body()
    createProductImageDto: CreateProductImageDto,
  ) {
    const image = await this.productImagesService.create(
      productId,
      createProductImageDto,
    );

    return {
      success: true,
      statusCode: 201,
      message: 'Product image created successfully',
      data: image,
    };
  }

  @Get()
  async findByProduct(
    @Param('productId')
    productId: string,
  ) {
    const images = await this.productImagesService.findByProduct(productId);

    return {
      success: true,
      statusCode: 200,
      message: 'Product images retrieved successfully',
      data: images,
    };
  }

  @Delete(':imageId')
  async remove(
    @Param('productId')
    productId: string,

    @Param('imageId')
    imageId: string,
  ) {
    const result = await this.productImagesService.remove(productId, imageId);

    return {
      success: true,
      statusCode: 200,
      message: 'Product image deleted successfully',
      data: result,
    };
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        altText: {
          type: 'string',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('altText') altText?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const image = await this.productImagesService.upload(
      productId,
      file,
      altText,
    );

    return {
      success: true,
      statusCode: 201,
      message: 'Product image uploaded successfully',
      data: image,
    };
  }
}
