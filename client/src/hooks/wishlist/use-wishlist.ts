'use client';

import { useQuery } from '@tanstack/react-query';
import { getWishlist } from '@/services/wishlist.service';

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });
};