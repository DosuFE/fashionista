export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  discount: string;
  total: string;
  shippingAddress: ShippingAddress;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  cancellationReason?: string | null;
  cancellationRequestStatus?:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | null;
  cancellationRequestedAt?: string | null;
  cancellationReviewedAt?: string | null;
  cancellationReviewNote?: string | null;
}

export interface CreateOrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Order;
}

export interface GetOrdersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Order[];
}


export interface GetOrderByIdResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Order;
}


export interface CancelOrderPayload {
  reason?: string;
}

export interface CancelOrderResult {
  orderId: string;
  orderNumber: string;
  status: string;
  cancellationRequestStatus:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | null;
  cancellationReason: string | null;
  cancellationRequestedAt: string | null;
  message: string;
}

export interface CancelOrderResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CancelOrderResult;
}


export type CancellationReviewDecision = 'APPROVED' | 'REJECTED';

export interface ReviewCancellationPayload {
  decision: CancellationReviewDecision;
  reviewNote?: string;
}

export interface ReviewCancellationResult {
  orderId: string;
  orderNumber: string;
  status: string;
  cancellationRequestStatus:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | null;
  cancellationReason: string | null;
  cancellationReviewedAt: string | null;
  cancellationReviewNote: string | null;
  message: string;
}

export interface ReviewCancellationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ReviewCancellationResult;
}


export interface PendingCancellationRequest {
  id: string;
  orderNumber: string;
  status: string;
  cancellationRequestStatus:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | null;
  cancellationReason: string | null;
  cancellationRequestedAt: string | null;
  createdAt: string;
}

export interface PendingCancellationRequestsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PendingCancellationRequest[];
}
