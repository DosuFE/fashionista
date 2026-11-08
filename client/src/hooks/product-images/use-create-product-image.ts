import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createProductImage,
} from '@/services/product-images.service';

import type {
  CreateProductImagePayload,
} from '@/types/product-image';

interface CreateProductImageVariables {
  productId: string;
  payload: CreateProductImagePayload;
}

export function useCreateProductImage() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: CreateProductImageVariables) =>
      createProductImage(
        productId,
        payload,
      ),

    onSuccess: (
      _data,
      variables,
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          'product-images',
          variables.productId,
        ],
      });
    },
  });
}