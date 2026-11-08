import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrdersService } from './orders.service';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

import { ReviewCancellationDto } from './dto/review-cancellation.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Req() req: Request,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const user = req.user as {
      id: string;
    };

    const order = await this.ordersService.createOrder(user.id, createOrderDto);

    return {
      success: true,
      statusCode: 201,
      message: 'Order created successfully',
      data: order,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Req() req: Request) {
    const user = req.user as { id: string };

    const orders = await this.ordersService.findUserOrders(user.id);

    return {
      success: true,
      statusCode: 200,
      message: 'Orders retrieved successfully',
      data: orders,
    };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllOrdersForAdmin() {
    const orders = await this.ordersService.findAllOrdersForAdmin();

    return {
      success: true,
      statusCode: 200,
      message: 'All orders retrieved successfully',
      data: orders,
    };
  }

  @Get('admin/order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getOrderByIdForAdmin(@Param('orderId', ParseUUIDPipe) orderId: string) {
    const order = await this.ordersService.findOrderByIdForAdmin(orderId);

    return {
      success: true,
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  @Patch('admin/order/:orderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateOrderStatus(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateOrderStatus(
      orderId,
      dto.status,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Order status updated successfully',
      data: order,
    };
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async getMyOrderById(
    @Req() req: Request,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    const user = req.user as { id: string };

    const order = await this.ordersService.findUserOrderById(user.id, orderId);

    return {
      success: true,
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  @Patch(':orderId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const user = req.user as { id: string };

    const result = await this.ordersService.cancelOrder(user.id, orderId, dto);

    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: result,
    };
  }

  @Patch(':orderId/cancellation-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async reviewCancellation(
    @Param('orderId') orderId: string,
    @Body() dto: ReviewCancellationDto,
  ) {
    const result = await this.ordersService.reviewCancellation(orderId, dto);

    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: result,
    };
  }

  @Get('cancellation-requests/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getPendingCancellationRequests() {
    const requests = await this.ordersService.findPendingCancellationRequests();

    return {
      success: true,
      statusCode: 200,
      message: 'Pending cancellation requests retrieved successfully',
      data: requests,
    };
  }
}
