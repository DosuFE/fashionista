import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { addCartItem } from '@/services/cart.service';

import type {
  AddCartItemPayload,
} from '@/types/cart';

export const useAddCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: AddCartItemPayload,
    ) => addCartItem(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      });
    },
  });
};