
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { updateProduct } from '@/services/products.service';

import type {
  UpdateProductPayload,
} from '@/types/product';

interface UpdateProductVariables {
  id: string;
  payload: UpdateProductPayload;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: UpdateProductVariables) =>
      updateProduct(id, payload),

    onSuccess: async (updatedProduct) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['products'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['products', updatedProduct.id],
        }),
      ]);
    },
  });
}
