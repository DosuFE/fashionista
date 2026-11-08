'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  CreateUserPayload,
  usersService,
} from '@/services/users.service';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      usersService.createUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });
}