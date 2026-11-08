export interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: string | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductVariantPayload {
  sku: string;
  size?: string;
  color?: string;
  price?: number;
  stockQuantity?: number;
}

export interface UpdateProductVariantPayload {
  sku?: string;
  size?: string;
  color?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
}