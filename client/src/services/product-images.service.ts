import { api } from '@/lib/api';

import type {
  ProductImage,
  CreateProductImagePayload,
  UploadProductImagePayload,
} from '@/types/product-image';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function createProductImage(
  productId: string,
  payload: CreateProductImagePayload,
): Promise<ProductImage> {
  const response =
    await api.post<ApiResponse<ProductImage>>(
      `/products/${productId}/images`,
      payload,
    );

  return response.data.data;
}

export async function getProductImages(
  productId: string,
): Promise<ProductImage[]> {
  const response =
    await api.get<ApiResponse<ProductImage[]>>(
      `/products/${productId}/images`,
    );

  return response.data.data;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
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
      `/products/${productId}/images/${imageId}`,
    );

  return response.data.data;
}

export async function uploadProductImage(
  productId: string,
  payload: UploadProductImagePayload,
): Promise<ProductImage> {
  const formData = new FormData();

  formData.append('file', payload.file);

  if (payload.altText) {
    formData.append('altText', payload.altText);
  }

  const response =
    await api.post<ApiResponse<ProductImage>>(
      `/products/${productId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

  return response.data.data;
}