
'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getPendingCancellationRequests,
} from '@/services/order.service';

export const usePendingCancellationRequests = () => {
  return useQuery({
    queryKey: ['orders', 'cancellation-requests', 'pending'],
    queryFn: getPendingCancellationRequests,
    retry: 1,
  });
};
