import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { createProductVariant } from '@/services/product-variants.service';

import type {
  CreateProductVariantPayload,
} from '@/types/product-variant';

interface CreateProductVariantVariables {
  productId: string;
  payload: CreateProductVariantPayload;
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: CreateProductVariantVariables) =>
      createProductVariant(productId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'product-variants',
          variables.productId,
        ],
      });
    },
  });
}