import { useMutation } from '@tanstack/react-query';

import {
  createProduct,
} from '@/services/products.service';

import type {
  CreateProductPayload,
} from '@/types/product';

export function useCreateProduct() {
  return useMutation({
    mutationFn: (
      payload: CreateProductPayload,
    ) => createProduct(payload),
  });
}