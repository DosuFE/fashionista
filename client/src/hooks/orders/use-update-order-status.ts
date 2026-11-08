'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateOrderStatus } from '@/services/order.service';

import type {
  UpdateOrderStatusPayload,
} from '@/services/order.service';

export const useUpdateOrderStatus = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) =>
      updateOrderStatus(orderId, payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['orders', 'admin', 'all'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders', 'admin', orderId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders', orderId],
        }),
      ]);
    },
  });
};