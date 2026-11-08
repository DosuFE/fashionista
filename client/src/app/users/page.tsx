'use client';

import Link from 'next/link';

import { useUsers } from '@/hooks/users/use-users';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUsers();

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading users...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-8">
        <p className="text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="text-muted-foreground">
            Manage Fashionista users.
          </p>
        </div>

        <Button asChild>
          <Link href="/users/create">
            Create User
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>

              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <Button asChild variant="outline">
                <Link
                href={`/users/${user.id}`}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                    View
                </Link>
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}