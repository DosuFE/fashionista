import { api } from '@/lib/api';

import type {
  DashboardOverviewResponse,
  RecentOrdersResponse,
} from '@/types/dashboard';


export const getDashboardOverview =
  async (): Promise<DashboardOverviewResponse> => {
    const response =
      await api.get<DashboardOverviewResponse>(
        '/dashboard/overview',
      );

    return response.data;
  };

export const getRecentOrders = async (): Promise<RecentOrdersResponse> => {
  const response = await api.get<RecentOrdersResponse>(
    '/dashboard/recent-orders',
  );

  return response.data;
};


import type { LowStockAlertsResponse } from '@/types/dashboard';

export const getLowStockAlerts = async (
  threshold: number = 5,
): Promise<LowStockAlertsResponse> => {
  const response = await api.get<LowStockAlertsResponse>(
    '/dashboard/low-stock',
    {
      params: { threshold },
    },
  );

  return response.data;
};

