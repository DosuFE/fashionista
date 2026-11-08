'use client';

import { useQuery } from '@tanstack/react-query';

import { getCategory } from '@/services/categories.service';

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategory(id),
    enabled: Boolean(id),
  });
}