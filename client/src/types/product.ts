import type { Category } from './category';

export interface Product {
  id: string;
  category: Category;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  discountPrice: string | null;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  categoryId: string;

  name: string;

  slug: string;

  description?: string;

  price: number;

  discountPrice?: number;

  sku: string;

  stockQuantity?: number;
}

export interface UpdateProductPayload {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  sku?: string;
  stockQuantity?: number;
  isActive?: boolean;
}

