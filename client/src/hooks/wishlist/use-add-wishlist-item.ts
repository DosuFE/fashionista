'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addWishlistItem,
} from '@/services/wishlist.service';

import type {
  AddWishlistItemPayload,
} from '@/types/wishlist';

export const useAddWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: AddWishlistItemPayload,
    ) => addWishlistItem(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['wishlist'],
      });
    },
  });
};