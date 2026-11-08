import { api } from '@/lib/api';

import type {
  AddCartItemPayload,
  AddCartItemResponse,
  Cart,
  UpdateCartItemPayload,
  UpdateCartItemResponse,
} from '@/types/cart';

/* =========================
   GET CART
========================= */

export const getCart = async (): Promise<Cart> => {
  const response = await api.get('/cart');

  return response.data.data;
};

/* =========================
   ADD CART ITEM
========================= */

export const addCartItem = async (
  payload: AddCartItemPayload,
): Promise<AddCartItemResponse> => {
  const response = await api.post(
    '/cart/items',
    payload,
  );

  return response.data.data;
};

/* =========================
   UPDATE CART ITEM
========================= */

export const updateCartItem = async (
  itemId: string,
  payload: UpdateCartItemPayload,
): Promise<UpdateCartItemResponse> => {
  const response = await api.patch(
    `/cart/items/${itemId}`,
    payload,
  );

  return response.data.data;
};

/* =========================
   DELETE CART ITEM
========================= */
export const deleteCartItem = async (
  itemId: string,
): Promise<void> => {
  await api.delete(
    `/cart/items/${itemId}`,
  );
};