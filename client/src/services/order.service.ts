import { api } from '@/lib/api';

import type {
  CreateOrderPayload,
  CreateOrderResponse,
  GetOrdersResponse,
  GetOrderByIdResponse,
  CancelOrderPayload,
  CancelOrderResponse,
  ReviewCancellationPayload,
  ReviewCancellationResponse,
  PendingCancellationRequestsResponse,
} from '@/types/order';

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>(
    '/orders',
    payload,
  );

  return response.data;
};

export const getOrders =
  async (): Promise<GetOrdersResponse> => {
    const response =
      await api.get<GetOrdersResponse>('/orders');

    return response.data;
  };

  
  export const getAllOrdersForAdmin = async (): Promise<GetOrdersResponse> => {
    const response = await api.get<GetOrdersResponse>('/orders/admin/all');
    return response.data;
  };

  
  export const getAdminOrderById = async (
    orderId: string,
  ): Promise<GetOrderByIdResponse> => {
    const response = await api.get<GetOrderByIdResponse>(
      `/orders/admin/order/${orderId}`,
    );

    return response.data;
  };

  export const getOrderById = async (
  orderId: string,
): Promise<GetOrderByIdResponse> => {
  const response =
    await api.get<GetOrderByIdResponse>(
      `/orders/${orderId}`,
    );

  return response.data;
};


export const cancelOrder = async (
  orderId: string,
  payload: CancelOrderPayload,
): Promise<CancelOrderResponse> => {
  const response = await api.patch<CancelOrderResponse>(
    `/orders/${orderId}/cancel`,
    payload,
  );

  return response.data;
};


export const reviewCancellation = async (
  orderId: string,
  payload: ReviewCancellationPayload,
): Promise<ReviewCancellationResponse> => {
  const response = await api.patch<ReviewCancellationResponse>(
    `/orders/${orderId}/cancellation-review`,
    payload,
  );

  return response.data;
};


export const getPendingCancellationRequests =
  async (): Promise<PendingCancellationRequestsResponse> => {
    const response =
      await api.get<PendingCancellationRequestsResponse>(
        '/orders/cancellation-requests/pending',
      );

    return response.data;
  };

  export type UpdateOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type UpdateOrderStatusPayload = {
  status: UpdateOrderStatus;
};

export type UpdateOrderStatusResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    orderNumber: string;
    status: UpdateOrderStatus;
    paymentStatus: string;
    updatedAt: string;
  };
};

export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload,
): Promise<UpdateOrderStatusResponse> => {
  const response = await api.patch<UpdateOrderStatusResponse>(
    `/orders/admin/order/${orderId}/status`,
    payload,
  );

  return response.data;
};