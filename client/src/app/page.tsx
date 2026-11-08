'use client';

import { useUsers } from '@/hooks/users/use-users';

export default function Home() {
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUsers();

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError) {
    return (
      <div>
        Error: {error.message}
      </div>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Users
      </h1>

      <div className="space-y-4">
        {users?.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border p-4"
          >
            <p>
              <strong>Name:</strong>{' '}
              {user.firstName} {user.lastName}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {user.email}
            </p>

            <p>
              <strong>Role:</strong>{' '}
              {user.role}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}