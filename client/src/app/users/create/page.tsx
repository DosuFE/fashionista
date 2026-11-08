'use client';

import { useRouter } from 'next/navigation';

import { UserForm } from '@/components/users/user-form';
import { useCreateUser } from '@/hooks/users/use-create-user';
import { CreateUserFormValues } from '@/schemas/user.schema';

export default function CreateUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  function handleSubmit(values: CreateUserFormValues) {
    createUser.mutate(values, {
      onSuccess: () => {
        router.push('/users');
      },
    });
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-3xl font-bold">
        Create User
      </h1>

      <p className="mb-8 text-muted-foreground">
        Create a new user account.
      </p>

      <UserForm
        onSubmit={handleSubmit}
        isLoading={createUser.isPending}
      />

      {createUser.isError && (
        <p className="mt-4 text-sm text-red-500">
          {createUser.error.message}
        </p>
      )}
    </main>
  );
}