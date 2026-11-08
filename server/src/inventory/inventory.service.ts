import { BadRequestException, Injectable } from '@nestjs/common';

import { ProductsService } from '../products/products.service';

import { StockOperation, UpdateStockDto } from './dto/update-stock.dto';

import { ProductVariantsService } from '../product-variants/product-variants.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly productsService: ProductsService,

    private readonly productVariantsService: ProductVariantsService,
  ) {}

  async getProductStock(productId: string) {
    const product = await this.productsService.findOne(productId);

    return {
      productId: product.id,
      productName: product.name,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    };
  }

  async updateProductStock(productId: string, dto: UpdateStockDto) {
    const product = await this.productsService.findOne(productId);

    if (dto.operation === StockOperation.DECREASE) {
      if (dto.quantity > product.stockQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      product.stockQuantity -= dto.quantity;
    }

    if (dto.operation === StockOperation.INCREASE) {
      product.stockQuantity += dto.quantity;
    }

    const updatedProduct = await this.productsService.save(product);

    return {
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      stockQuantity: updatedProduct.stockQuantity,
      operation: dto.operation,
      quantityChanged: dto.quantity,
    };
  }

  async getVariantStock(productId: string, variantId: string) {
    const variant = await this.productVariantsService.findOne(
      productId,
      variantId,
    );

    return {
      productId,
      variantId: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
    };
  }

  async updateVariantStock(
    productId: string,
    variantId: string,
    dto: UpdateStockDto,
  ) {
    const variant = await this.productVariantsService.findOne(
      productId,
      variantId,
    );

    // DECREASE STOCK
    if (dto.operation === StockOperation.DECREASE) {
      if (dto.quantity > variant.stockQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      variant.stockQuantity -= dto.quantity;
    }

    // INCREASE STOCK
    if (dto.operation === StockOperation.INCREASE) {
      variant.stockQuantity += dto.quantity;
    }

    const updatedVariant = await this.productVariantsService.save(variant);

    return {
      productId,
      variantId: updatedVariant.id,
      sku: updatedVariant.sku,
      stockQuantity: updatedVariant.stockQuantity,
      operation: dto.operation,
      quantityChanged: dto.quantity,
    };
  }
}
