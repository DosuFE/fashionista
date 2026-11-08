import type { User } from '@/types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginData {
  user: User;
  accessToken: string;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginData;
}