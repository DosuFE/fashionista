
import { useQuery } from '@tanstack/react-query';
import { getAllOrdersForAdmin } from '@/services/order.service';

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['orders', 'admin', 'all'],
    queryFn: getAllOrdersForAdmin,
  });
};
