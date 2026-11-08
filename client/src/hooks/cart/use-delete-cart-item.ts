import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { deleteCartItem } from '@/services/cart.service';

export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      deleteCartItem(itemId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      });
    },
  });
};