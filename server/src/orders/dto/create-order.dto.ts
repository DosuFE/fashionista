import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsObject()
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}
