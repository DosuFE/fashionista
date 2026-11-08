import { Module } from '@nestjs/common';

import { InventoryController } from './inventory.controller';

import { InventoryService } from './inventory.service';

import { ProductsModule } from '../products/products.module';

import { ProductVariantsModule } from '../product-variants/product-variants.module';

@Module({
  imports: [ProductsModule, ProductVariantsModule],

  controllers: [InventoryController],

  providers: [InventoryService],
})
export class InventoryModule {}
