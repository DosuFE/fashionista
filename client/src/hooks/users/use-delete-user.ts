'use client';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { usersService } from '@/services/users.service';

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      usersService.deleteUser(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ['user', id],
      });

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });
}