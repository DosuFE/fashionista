'use client';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  updateCategory,
  type UpdateCategoryPayload,
} from '@/services/categories.service';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => updateCategory(id, payload),

    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });

      queryClient.setQueryData(
        ['categories', updatedCategory.id],
        updatedCategory,
      );
    },
  });
}