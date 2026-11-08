import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { deleteProduct } from '@/services/products.service';

export function useDeleteProduct() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteProduct(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
}