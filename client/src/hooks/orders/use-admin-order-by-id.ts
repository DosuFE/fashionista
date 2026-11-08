
import { useQuery } from '@tanstack/react-query';
import { getAdminOrderById } from '@/services/order.service';

export const useAdminOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', 'admin', orderId],
    queryFn: () => getAdminOrderById(orderId),
    enabled: Boolean(orderId),
  });
};
