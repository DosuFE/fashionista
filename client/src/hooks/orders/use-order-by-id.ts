
'use client';

import { useQuery } from '@tanstack/react-query';

import { getOrderById } from '@/services/order.service';

export const useOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
  });
};
