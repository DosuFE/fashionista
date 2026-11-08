import { IsEnum, IsInt, Min } from 'class-validator';

export enum StockOperation {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}

export class UpdateStockDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(StockOperation)
  operation: StockOperation;
}
