import { api } from '@/lib/api';

export interface HealthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    status: string;
  };
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/health');

  return response.data;
}