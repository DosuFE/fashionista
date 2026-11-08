import { useQuery } from '@tanstack/react-query';

import {
  getProductStock,
} from '@/services/inventory.service';

export function useProductStock(
  productId: string,
) {
  return useQuery({
    queryKey: [
      'product-stock',
      productId,
    ],

    queryFn: () =>
      getProductStock(productId),

    enabled: Boolean(productId),
  });
}