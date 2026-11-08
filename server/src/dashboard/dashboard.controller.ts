import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '../users/entities/user.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview() {
    const overview = await this.dashboardService.getOverview();

    return {
      success: true,
      statusCode: 200,
      message: 'Dashboard overview retrieved successfully',
      data: overview,
    };
  }

  @Get('recent-orders')
  async getRecentOrders() {
    const orders = await this.dashboardService.getRecentOrders();

    return {
      success: true,
      statusCode: 200,
      message: 'Recent orders retrieved successfully',
      data: orders,
    };
  }

  @Get('low-stock')
  async getLowStockAlerts(
    @Query('threshold', new DefaultValuePipe(5), ParseIntPipe)
    threshold: number,
  ) {
    if (threshold < 0) {
      throw new BadRequestException('Stock threshold cannot be negative');
    }

    const alerts = await this.dashboardService.getLowStockAlerts(threshold);

    return {
      success: true,
      statusCode: 200,
      message: 'Low-stock inventory alerts retrieved successfully',
      data: alerts,
    };
  }
}
