import { api } from '@/lib/api';
import type { Category } from '@/types/category';

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  const response = await api.post('/categories', payload);

  return response.data.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/categories');

  return response.data.data;
}

export async function getCategory(
  id: string,
): Promise<Category> {
  const response = await api.get(`/categories/${id}`);

  return response.data.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const response = await api.patch(
    `/categories/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteCategory(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const response = await api.delete(
    `/categories/${id}`,
  );

  return response.data.data;
}