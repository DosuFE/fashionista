import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateProductStock,
} from '@/services/inventory.service';

import type {
  UpdateStockPayload,
} from '@/types/inventory';

interface UpdateProductStockVariables {
  productId: string;
  payload: UpdateStockPayload;
}

export function useUpdateProductStock() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: UpdateProductStockVariables) =>
      updateProductStock(
        productId,
        payload,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'product-stock',
          variables.productId,
        ],
      });
    },
  });
}