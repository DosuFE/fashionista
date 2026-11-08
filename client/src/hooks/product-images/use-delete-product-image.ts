import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteProductImage,
} from '@/services/product-images.service';

interface DeleteProductImageVariables {
  productId: string;
  imageId: string;
}

export function useDeleteProductImage() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: DeleteProductImageVariables) =>
      deleteProductImage(
        productId,
        imageId,
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