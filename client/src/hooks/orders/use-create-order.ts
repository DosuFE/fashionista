'use client';

import { useMutation } from '@tanstack/react-query';

import { createOrder } from '@/services/order.service';

import type {
  CreateOrderPayload,
} from '@/types/order';

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (
      payload: CreateOrderPayload,
    ) => createOrder(payload),
  });
};