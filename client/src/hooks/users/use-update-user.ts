'use client';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  UpdateUserPayload,
  usersService,
} from '@/services/users.service';

interface UpdateUserVariables {
  id: string;
  payload: UpdateUserPayload;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: UpdateUserVariables) =>
      usersService.updateUser(id, payload),

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(
        ['user', updatedUser.id],
        updatedUser,
      );

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });
}