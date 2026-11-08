import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { ProductVariantsService } from './product-variants.service';

import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    const variant = await this.productVariantsService.create(productId, dto);

    return {
      success: true,
      statusCode: 201,
      message: 'Product variant created successfully',
      data: variant,
    };
  }

  @Get()
  async findByProduct(@Param('productId') productId: string) {
    const variants = await this.productVariantsService.findByProduct(productId);

    return {
      success: true,
      statusCode: 200,
      message: 'Product variants retrieved successfully',
      data: variants,
    };
  }

  @Get(':variantId')
  async findOne(
    @Param('productId') productId: string,
    @Param('variantId', new ParseUUIDPipe()) variantId: string,
  ) {
    const variant = await this.productVariantsService.findOne(
      productId,
      variantId,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Product variant retrieved successfully',
      data: variant,
    };
  }

  @Patch(':variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    const variant = await this.productVariantsService.update(
      productId,
      variantId,
      dto,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Product variant updated successfully',
      data: variant,
    };
  }

  @Delete(':variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    const result = await this.productVariantsService.remove(
      productId,
      variantId,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Product variant deleted successfully',
      data: result,
    };
  }
}
