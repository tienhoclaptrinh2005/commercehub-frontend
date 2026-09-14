export interface SellerDailyRevenue {
  day: number;
  amount: number;
}

export interface SellerOrderStatusCount {
  status: string;
  count: number;
}

export interface SellerRecentOrder {
  orderId: number;
  orderCode: string;
  productSummary: string;
  totalAmount: number;
  status: string;
  placedAt: string;
}

export interface SellerDashboardData {
  month: string;
  daysInMonth: number;
  orderCount: number;
  revenue: number;
  availableBalance: number;
  holdBalance: number;
  newPreOrderRequestCount: number;
  processingPreOrderCount: number;
  dailyRevenue: SellerDailyRevenue[];
  orderStatusCounts: SellerOrderStatusCount[];
  recentOrders: SellerRecentOrder[];
}

export interface SellerNotificationData {
  recentInstantOrderCount: number;
  newPreOrderRequestCount: number;
  processingPreOrderCount: number;
  activeDisputeCount: number;
  withdrawalUpdateCount: number;
}
