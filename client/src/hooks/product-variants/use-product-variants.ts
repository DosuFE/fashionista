import { useQuery } from '@tanstack/react-query';

import { getProductVariants } from '@/services/product-variants.service';

export function useProductVariants(
  productId: string,
) {
  return useQuery({
    queryKey: [
      'product-variants',
      productId,
    ],

    queryFn: () =>
      getProductVariants(productId),

    enabled: Boolean(productId),
  });
}