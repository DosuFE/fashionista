
import { IsEnum } from 'class-validator';

import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Please provide a valid order status',
  })
  status: OrderStatus;
}
