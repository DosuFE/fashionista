import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product, ProductVariant])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
