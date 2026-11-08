'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormValues,
  UpdateUserFormValues,
} from '@/schemas/user.schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserFormProps {
  mode: 'create' | 'edit';

  defaultValues?: Partial<
    CreateUserFormValues & UpdateUserFormValues
  >;

  onSubmit: (
    values:
      | CreateUserFormValues
      | UpdateUserFormValues,
  ) => void;

  isLoading?: boolean;
}

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const form = useForm<
    CreateUserFormValues | UpdateUserFormValues
  >({
    resolver: zodResolver(
      mode === 'create'
        ? createUserSchema
        : updateUserSchema,
    ),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'CUSTOMER',
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">
          First name
        </Label>

        <Input
          id="firstName"
          {...form.register('firstName')}
          placeholder="Enter first name"
        />

        {form.formState.errors.firstName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.firstName.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">
          Last name
        </Label>

        <Input
          id="lastName"
          {...form.register('lastName')}
          placeholder="Enter last name"
        />

        {form.formState.errors.lastName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.lastName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email
        </Label>

        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="user@example.com"
        />

        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password — CREATE ONLY */}
      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="password">
            Password
          </Label>

          <Input
            id="password"
            type="password"
            {...form.register('password')}
            placeholder="Minimum 8 characters"
          />

          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
      )}

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone
        </Label>

        <Input
          id="phone"
          {...form.register('phone')}
          placeholder="08012345678"
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role
        </Label>

        <select
          id="role"
          {...form.register('role')}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="CUSTOMER">
            Customer
          </option>

          <option value="STAFF">
            Staff
          </option>

          <option value="ADMIN">
            Admin
          </option>

          <option value="SUPER_ADMIN">
            Super Admin
          </option>
        </select>
      </div>

      {/* Edit-only fields */}
      {mode === 'edit' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="status">
              Status
            </Label>

            <select
              id="status"
              {...form.register('status')}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>

              <option value="DEACTIVATED">
                Deactivated
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="emailVerified"
              type="checkbox"
              {...form.register('emailVerified')}
            />

            <Label htmlFor="emailVerified">
              Email verified
            </Label>
          </div>
        </>
      )}

      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading
          ? mode === 'create'
            ? 'Creating...'
            : 'Updating...'
          : mode === 'create'
            ? 'Create User'
            : 'Update User'}
      </Button>
    </form>
  );
}