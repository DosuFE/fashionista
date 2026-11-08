'use client';

import { useQuery } from '@tanstack/react-query';

import { usersService } from '@/services/users.service';

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUser(id),
    enabled: Boolean(id),
  });
}