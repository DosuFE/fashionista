export interface DashboardOverview {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardOverview;
}


export interface RecentOrder {
  id: string;
  orderNumber: string;

  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };

  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface RecentOrdersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: RecentOrder[];
}



export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface LowStockVariant {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface LowStockAlerts {
  threshold: number;
  totalLowStockProducts: number;
  totalLowStockVariants: number;
  totalAlerts: number;
  products: LowStockProduct[];
  variants: LowStockVariant[];
}

export interface LowStockAlertsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LowStockAlerts;
}
