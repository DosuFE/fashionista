import { useQuery } from '@tanstack/react-query';

import { getCart } from '@/services/cart.service';

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });
};