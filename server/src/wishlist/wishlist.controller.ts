import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWishlist(@Req() req: Request) {
    const user = req.user as {
      id: string;
    };

    const wishlist = await this.wishlistService.getWishlist(user.id);

    return {
      success: true,
      statusCode: 200,
      message: 'Wishlist retrieved successfully',
      data: wishlist,
    };
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  async addItem(
    @Req() req: Request,
    @Body() addWishlistItemDto: AddWishlistItemDto,
  ) {
    const user = req.user as { id: string };

    const item = await this.wishlistService.addItem(
      user.id,
      addWishlistItemDto.productId,
    );

    return {
      success: true,
      statusCode: 201,
      message: 'Product added to wishlist successfully',
      data: item,
    };
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  async deleteItem(@Req() req: Request, @Param('itemId') itemId: string) {
    const user = req.user as { id: string };

    const result = await this.wishlistService.deleteItem(user.id, itemId);

    return {
      success: true,
      statusCode: 200,
      message: 'Wishlist item removed successfully',
      data: result,
    };
  }
}
