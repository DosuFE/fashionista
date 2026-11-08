import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Req() req: Request) {
    const user = req.user as {
      id: string;
    };

    const cart = await this.cartService.getCart(user.id);

    return {
      success: true,
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: cart,
    };
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  async addItem(@Req() req: Request, @Body() dto: AddCartItemDto) {
    const user = req.user as {
      id: string;
    };

    const item = await this.cartService.addItem(user.id, dto);

    return {
      success: true,
      statusCode: 201,
      message: 'Item added to cart successfully',
      data: item,
    };
  }

  @Patch('items/:itemId')
  @UseGuards(JwtAuthGuard)
  async updateItem(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const user = req.user as {
      id: string;
    };

    const item = await this.cartService.updateItem(user.id, itemId, dto);

    return {
      success: true,
      statusCode: 200,
      message: 'Cart item updated successfully',
      data: item,
    };
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  async deleteItem(@Req() req: Request, @Param('itemId') itemId: string) {
    const user = req.user as { id: string };

    const result = await this.cartService.deleteItem(user.id, itemId);

    return {
      success: true,
      statusCode: 200,
      message: 'Cart item removed successfully',
      data: result,
    };
  }
}
