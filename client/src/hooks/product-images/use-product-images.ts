import { useQuery } from '@tanstack/react-query';

import { getProductImages } from '@/services/product-images.service';

export function useProductImages(
  productId: string,
) {
  return useQuery({
    queryKey: [
      'product-images',
      productId,
    ],

    queryFn: () =>
      getProductImages(productId),

    enabled: Boolean(productId),
  });
}