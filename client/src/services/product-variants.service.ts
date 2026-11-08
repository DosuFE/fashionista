import { api } from '@/lib/api';

import type {
  CreateProductVariantPayload,
  ProductVariant,
  UpdateProductVariantPayload,
} from '@/types/product-variant';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function createProductVariant(
  productId: string,
  payload: CreateProductVariantPayload,
): Promise<ProductVariant> {
  const response =
    await api.post<ApiResponse<ProductVariant>>(
      `/products/${productId}/variants`,
      payload,
    );

  return response.data.data;
}

export async function getProductVariants(
  productId: string,
): Promise<ProductVariant[]> {
  const response =
    await api.get<ApiResponse<ProductVariant[]>>(
      `/products/${productId}/variants`,
    );

  return response.data.data;
}

export async function getProductVariant(
  productId: string,
  variantId: string,
): Promise<ProductVariant> {
  const response =
    await api.get<ApiResponse<ProductVariant>>(
      `/products/${productId}/variants/${variantId}`,
    );

  return response.data.data;
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: UpdateProductVariantPayload,
): Promise<ProductVariant> {
  const response =
    await api.patch<ApiResponse<ProductVariant>>(
      `/products/${productId}/variants/${variantId}`,
      payload,
    );

  return response.data.data;
}

export async function deleteProductVariant(
  productId: string,
  variantId: string,
): Promise<{
  id: string;
  deleted: boolean;
}> {
  const response =
    await api.delete<
      ApiResponse<{
        id: string;
        deleted: boolean;
      }>
    >(
      `/products/${productId}/variants/${variantId}`,
    );

  return response.data.data;
}