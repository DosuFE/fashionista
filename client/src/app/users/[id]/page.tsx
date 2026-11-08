'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/users/use-user';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import router from 'next/router';

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserPage({
  params,
}: UserPageProps) {
  const { id } = use(params);
  

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useUser(id);

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading user...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-8">
        <p>Error: {error.message}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8">
        <p>User not found.</p>
      </main>
    );
  }
  

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        User Details
      </h1>

      <div className="space-y-2 rounded-lg border p-6">
        <p>
          <strong>Name:</strong>{' '}
          {user.firstName} {user.lastName}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Phone:</strong>{' '}
          {user.phone ?? 'No phone number'}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <p>
          <strong>Status:</strong> {user.status}
        </p>

        <p>
          <strong>Email Verified:</strong>{' '}
          {user.emailVerified ? 'Yes' : 'No'}
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/users/${user.id}/edit`}>
            Edit User
          </Link>
        </Button>

        <DeleteUserDialog
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          onDeleted={() => {
            router.push('/users');
          }}
        />
      </div>
    </main>
  );
}