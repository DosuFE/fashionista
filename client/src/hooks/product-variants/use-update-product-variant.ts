import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateProductVariant,
} from '@/services/product-variants.service';

import type {
  UpdateProductVariantPayload,
} from '@/types/product-variant';

interface UpdateProductVariantVariables {
  productId: string;
  variantId: string;
  payload: UpdateProductVariantPayload;
}

export function useUpdateProductVariant() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      payload,
    }: UpdateProductVariantVariables) =>
      updateProductVariant(
        productId,
        variantId,
        payload,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'product-variants',
          variables.productId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'product-variant',
          variables.productId,
          variables.variantId,
        ],
      });
    },
  });
}