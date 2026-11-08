
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelOrder } from '@/services/order.service';

import type {
  CancelOrderPayload,
} from '@/types/order';

export const useCancelOrder = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelOrderPayload) =>
      cancelOrder(orderId, payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['orders'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders', orderId],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            'orders',
            'cancellation-requests',
            'pending',
          ],
        }),
      ]);
    },
  });
};
