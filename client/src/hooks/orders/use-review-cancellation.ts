
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewCancellation } from '@/services/order.service';
import type { ReviewCancellationPayload } from '@/types/order';

export const useReviewCancellation = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewCancellationPayload) =>
      reviewCancellation(orderId, payload),

    
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
