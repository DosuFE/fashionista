import { useQuery } from '@tanstack/react-query';

import {
  getVariantStock,
} from '@/services/inventory.service';

export function useVariantStock(
  productId: string,
  variantId: string,
) {
  return useQuery({
    queryKey: [
      'variant-stock',
      productId,
      variantId,
    ],

    queryFn: () =>
      getVariantStock(
        productId,
        variantId,
      ),

    enabled:
      Boolean(productId) &&
      Boolean(variantId),
  });
}