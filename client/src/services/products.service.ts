import { api } from '@/lib/api';

import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@/types/product';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function getProducts(): Promise<Product[]> {
  const response =
    await api.get<ApiResponse<Product[]>>(
      '/products',
    );

  return response.data.data;
}

export async function getProduct(
  id: string,
): Promise<Product> {
  const response =
    await api.get<ApiResponse<Product>>(
      `/products/${id}`,
    );

  return response.data.data;
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response =
    await api.post<ApiResponse<Product>>(
      '/products',
      payload,
    );

  return response.data.data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const response =
    await api.patch<ApiResponse<Product>>(
      `/products/${id}`,
      payload,
    );

  return response.data.data;
}

export async function deleteProduct(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const response =
    await api.delete<
      ApiResponse<{
        id: string;
        deleted: boolean;
      }>
    >(`/products/${id}`);

  return response.data.data;
}