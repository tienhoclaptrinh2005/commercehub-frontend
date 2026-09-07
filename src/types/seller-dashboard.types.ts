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
  activeProductCount: number;
  dailyRevenue: SellerDailyRevenue[];
  orderStatusCounts: SellerOrderStatusCount[];
  recentOrders: SellerRecentOrder[];
}
