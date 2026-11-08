
'use client';

import { useQuery } from '@tanstack/react-query';

import { getRecentOrders } from '@/services/dashboard.service';

export const useRecentOrders = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: getRecentOrders,
    retry: 1,
  });
};
