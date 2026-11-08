
import { IsString, Length, Matches } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @Length(1, 100)
  @Matches(/^[A-Za-z0-9._=-]+$/)
  reference: string;
}
