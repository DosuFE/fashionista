import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateCartItem,
} from '@/services/cart.service';

import type {
  UpdateCartItemPayload,
} from '@/types/cart';

interface UpdateCartItemVariables {
  itemId: string;
  payload: UpdateCartItemPayload;
}

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: UpdateCartItemVariables) =>
      updateCartItem(
        itemId,
        payload,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      });
    },
  });
};