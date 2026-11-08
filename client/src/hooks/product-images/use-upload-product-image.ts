import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { uploadProductImage } from '@/services/product-images.service';

import type { UploadProductImagePayload } from '@/types/product-image';

interface UploadProductImageVariables {
  productId: string;
  payload: UploadProductImagePayload;
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: UploadProductImageVariables) =>
      uploadProductImage(productId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'product-images',
          variables.productId,
        ],
      });
    },
  });
}