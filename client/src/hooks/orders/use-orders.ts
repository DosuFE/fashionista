'use client';

import { useQuery } from '@tanstack/react-query';

import { getOrders } from '@/services/order.service';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
};