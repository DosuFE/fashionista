export type UserRole =
  | 'CUSTOMER'
  | 'STAFF'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}