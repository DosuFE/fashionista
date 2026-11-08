import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteProductVariant,
} from '@/services/product-variants.service';

interface DeleteProductVariantVariables {
  productId: string;
  variantId: string;
}

export function useDeleteProductVariant() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: DeleteProductVariantVariables) =>
      deleteProductVariant(
        productId,
        variantId,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'product-variants',
          variables.productId,
        ],
      });

      queryClient.removeQueries({
        queryKey: [
          'product-variant',
          variables.productId,
          variables.variantId,
        ],
      });
    },
  });
}