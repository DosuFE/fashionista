'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getDashboardOverview,
} from '@/services/dashboard.service';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: getDashboardOverview,
    retry: 1,
  });
};