'use client';

import { useDeleteUser } from '@/hooks/users/use-delete-user';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
  onDeleted?: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  onDeleted,
}: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  function handleDelete() {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        onDeleted?.();
      },
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete user?
          </AlertDialogTitle>

          <AlertDialogDescription>
            You are about to delete{' '}
            <strong>{userName}</strong>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending
              ? 'Deleting...'
              : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}