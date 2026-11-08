
'use client';

import { useQuery } from '@tanstack/react-query';

import { getLowStockAlerts } from '@/services/dashboard.service';

export const useLowStockAlerts = (threshold: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'low-stock', threshold],
    queryFn: () => getLowStockAlerts(threshold),
    retry: 1,
  });
};
