import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  updateVariantStock,
} from '@/services/inventory.service';

import type {
  UpdateStockPayload,
} from '@/types/inventory';

export function useUpdateVariantStock(
  productId: string,
  variantId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateStockPayload,
    ) =>
      updateVariantStock(
        productId,
        variantId,
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'variant-stock',
          productId,
          variantId,
        ],
      });
    },
  });
}