
import { api } from '@/lib/api';

export interface InitializePaymentResponse {
  message: string;
  authorizationUrl: string;
  reference: string;
  amount: number;
  currency: string;
}

export const paymentService = {
  async initializePayment(
    orderId: string,
  ): Promise<InitializePaymentResponse> {
    const response = await api.post<InitializePaymentResponse>(
      `/payments/orders/${orderId}/initialize`,
    );

    return response.data;
  },
};
