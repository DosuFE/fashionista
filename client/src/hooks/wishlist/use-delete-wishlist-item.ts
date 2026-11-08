'use client';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteWishlistItem,
} from '@/services/wishlist.service';

export const useDeleteWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      deleteWishlistItem(itemId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['wishlist'],
      });
    },
  });
};