'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';

import { UserForm } from '@/components/users/user-form';
import { useUser } from '@/hooks/users/use-user';
import { useUpdateUser } from '@/hooks/users/use-update-user';

import type { UpdateUserFormValues } from '@/schemas/user.schema';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({
  params,
}: EditUserPageProps) {
  const { id } = use(params);

  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useUser(id);

  const updateUser = useUpdateUser();

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading user...</p>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="p-8">
        <p className="text-red-500">
          {error?.message ?? 'User not found'}
        </p>
      </main>
    );
  }

  function handleSubmit(
    values:
      | UpdateUserFormValues
      | Record<string, unknown>,
  ) {
    updateUser.mutate(
      {
        id,
        payload: values as UpdateUserFormValues,
      },
      {
        onSuccess: () => {
          router.push(`/users/${id}`);
        },
      },
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-3xl font-bold">
        Edit User
      </h1>

      <p className="mb-8 text-muted-foreground">
        Update {user.firstName} {user.lastName}'s account.
      </p>

      <UserForm
        mode="edit"
        defaultValues={{
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        }}
        onSubmit={handleSubmit}
        isLoading={updateUser.isPending}
      />

      {updateUser.isError && (
        <p className="mt-4 text-sm text-red-500">
          {updateUser.error.message}
        </p>
      )}
    </main>
  );
}