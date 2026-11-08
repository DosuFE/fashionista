import { api } from '@/lib/api';
import { User } from '@/types/user';

export interface CreateUserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role?: User['role'];
}

export interface UpdateUserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role?: User['role'];
    status?: User['status'];
    emailVerified?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

export const usersService = {
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>> (
            '/users'
        );

        return response.data.data;
    },
 
    getUser: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>> (
            `/users/${id}`,
        );
        return response.data.data;
    },

    createUser: async (payload: CreateUserPayload, ): Promise<User> => {
        const response = await api.post<ApiResponse<User>> (
            'users/',
            payload,
        );

        return response.data.data;
    },

    updateUser: async(id: string, payload: UpdateUserPayload): Promise<User> => {
        const response = await api.patch<ApiResponse<User>> (
            `/users/${id}`,
            payload
        );

        return response.data.data;
    },

    deleteUser: async(id: string): Promise<null> => {
        const response = await api.delete<ApiResponse<null>> (
            `/users/${id}`
        );

        return response.data.data;
    },
}



