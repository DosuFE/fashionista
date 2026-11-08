import { api } from '@/lib/api';

import type {
  ProductStock,
  ProductVariantStock,
  UpdateStockPayload,
} from '@/types/inventory';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function getProductStock(
  productId: string,
): Promise<ProductStock> {
  const response =
    await api.get<ApiResponse<ProductStock>>(
      `/products/${productId}/stock`,
    );

  return response.data.data;
}

export async function updateProductStock(
  productId: string,
  payload: UpdateStockPayload,
): Promise<{
  productId: string;
  productName: string;
  stockQuantity: number;
  operation: 'INCREASE' | 'DECREASE';
  quantityChanged: number;
}> {
  const response =
    await api.patch<
      ApiResponse<{
        productId: string;
        productName: string;
        stockQuantity: number;
        operation:
          | 'INCREASE'
          | 'DECREASE';
        quantityChanged: number;
      }>
    >(
      `/products/${productId}/stock`,
      payload,
    );

  return response.data.data;
}

export async function getVariantStock(
  productId: string,
  variantId: string,
): Promise<ProductVariantStock> {
  const response =
    await api.get<
      ApiResponse<ProductVariantStock>
    >(
      `/products/${productId}/variants/${variantId}/stock`,
    );

  return response.data.data;
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  payload: UpdateStockPayload,
): Promise<{
  productId: string;
  variantId: string;
  sku: string;
  stockQuantity: number;
  operation: 'INCREASE' | 'DECREASE';
  quantityChanged: number;
}> {
  const response =
    await api.patch<
      ApiResponse<{
        productId: string;
        variantId: string;
        sku: string;
        stockQuantity: number;
        operation:
          | 'INCREASE'
          | 'DECREASE';
        quantityChanged: number;
      }>
    >(
      `/products/${productId}/variants/${variantId}/stock`,
      payload,
    );

  return response.data.data;
}