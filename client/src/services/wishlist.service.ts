import { api } from '@/lib/api';

import type {
  AddWishlistItemPayload,
  AddWishlistItemResponse,
  Wishlist,
} from '@/types/wishlist';

export const getWishlist = async (): Promise<Wishlist> => {
  const response = await api.get('/wishlist');

  return response.data.data;
};

export const addWishlistItem = async (
  payload: AddWishlistItemPayload,
): Promise<AddWishlistItemResponse> => {
  const response = await api.post(
    '/wishlist/items',
    payload,
  );

  return response.data.data;
};

export const deleteWishlistItem = async (
  itemId: string,
): Promise<void> => {
  await api.delete(`/wishlist/items/${itemId}`);
};