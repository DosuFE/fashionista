import { useQuery } from '@tanstack/react-query';

import { getProductVariant } from '@/services/product-variants.service';

export function useProductVariant(
  productId: string,
  variantId: string,
) {
  return useQuery({
    queryKey: [
      'product-variant',
      productId,
      variantId,
    ],

    queryFn: () =>
      getProductVariant(
        productId,
        variantId,
      ),

    enabled:
      Boolean(productId) &&
      Boolean(variantId),
  });
}