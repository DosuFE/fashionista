import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { InventoryService } from './inventory.service';

import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('products')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productId/stock')
  async getProductStock(
    @Param('productId')
    productId: string,
  ) {
    const stock = await this.inventoryService.getProductStock(productId);

    return {
      success: true,
      statusCode: 200,
      message: 'Product stock retrieved successfully',
      data: stock,
    };
  }

  @Patch(':productId/stock')
  async updateProductStock(
    @Param('productId')
    productId: string,

    @Body()
    dto: UpdateStockDto,
  ) {
    const stock = await this.inventoryService.updateProductStock(
      productId,
      dto,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Product stock updated successfully',
      data: stock,
    };
  }

  @Get(':productId/variants/:variantId/stock')
  async getVariantStock(
    @Param('productId')
    productId: string,

    @Param('variantId')
    variantId: string,
  ) {
    const stock = await this.inventoryService.getVariantStock(
      productId,
      variantId,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Product variant stock retrieved successfully',
      data: stock,
    };
  }

  @Patch(':productId/variants/:variantId/stock')
  async updateVariantStock(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateStockDto,
  ) {
    const stock = await this.inventoryService.updateVariantStock(
      productId,
      variantId,
      dto,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Product variant stock updated successfully',
      data: stock,
    };
  }
}
