import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),

  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters'),

  phone: z
    .string()
    .optional(),

  role: z
    .enum([
      'CUSTOMER',
      'STAFF',
      'ADMIN',
      'SUPER_ADMIN',
    ])
    .optional(),
});

export type CreateUserFormValues =
  z.infer<typeof createUserSchema>;


export const updateUserSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),

  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters'),

  phone: z
    .string()
    .optional(),

  role: z.enum([
    'CUSTOMER',
    'STAFF',
    'ADMIN',
    'SUPER_ADMIN',
  ]),

  status: z.enum([
    'ACTIVE',
    'SUSPENDED',
    'DEACTIVATED',
  ]),

  emailVerified: z.boolean(),
});

export type UpdateUserFormValues =
  z.infer<typeof updateUserSchema>;