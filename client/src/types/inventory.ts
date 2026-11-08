export interface ProductStock {
  productId: string;
  productName: string;
  stockQuantity: number;
  isActive: boolean;
}

export type StockOperation =
  | 'INCREASE'
  | 'DECREASE';

export interface UpdateStockPayload {
  quantity: number;
  operation: StockOperation;
}

export interface ProductVariantStock {
  productId: string;
  variantId: string;
  sku: string;
  size: string | null;
  color: string | null;
  stockQuantity: number;
  isActive: boolean;
}