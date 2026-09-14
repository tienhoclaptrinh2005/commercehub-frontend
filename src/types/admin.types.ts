export interface AdminDailyMetric { date: string; gmv: number; fee: number; orderCount: number }
export interface AdminLeaderboardItem { id: number; name: string; amount: number; orderCount: number }
export interface AdminDashboard {
  totalUsers: number; activeSellers: number; pendingShops: number; activeShops: number;
  activeProducts: number; ordersThisMonth: number; openDisputes: number; disputeRate: number;
  pendingWithdrawals: number; depositsNeedReview: number; gmvThisMonth: number;
  collectedFeesThisMonth: number; totalCollectedFees: number; totalHoldBalance: number;
  dailyMetrics: AdminDailyMetric[]; topShops: AdminLeaderboardItem[]; topCategories: AdminLeaderboardItem[];
}
export interface AdminUser {
  id:number; email:string; username:string|null; fullName:string; avatarUrl:string|null; status:string;
  banReason:string|null; role:string; provider:string; level:number; accumulatedSpent:number;
  accumulatedEarned:number; emailVerified:boolean; phoneVerified:boolean; createdAt:string; lastActiveAt:string;
}
export interface AdminShop {
  id:number; ownerId:number; ownerEmail:string; ownerUsername:string|null; name:string; slug:string;
  avatarUrl:string|null; status:string; productCount:number; soldCount:number; totalOrders:number;
  totalDisputes:number; disputeRate:number; ratingAvg:number; ratingCount:number; version:number; createdAt:string;
}
export interface AdminProduct {
  id:number; shopId:number; shopName:string; categoryId:number; categoryName:string; name:string; slug:string;
  thumbnailUrl:string|null; productType:string; deliveryType:string; status:string; soldCount:number;
  stockCount:number; minPrice:number|null; createdAt:string; updatedAt:string;
}
export interface AdminCategory { id:number; name:string; slug:string; iconUrl:string|null; active:boolean; sortOrder:number; parentId:number|null; parentName:string|null; productCount:number }
export interface AdminDeposit { id:number; userId:number; username:string|null; email:string; amount:number; provider:string; transactionCode:string|null; providerTransactionId:string|null; status:string; expiresAt:string; paidAt:string|null; processedAt:string|null; createdAt:string }
export interface AdminWithdrawal { id:number; userId:number; username:string|null; email:string; amount:number; fee:number; bankName:string; accountNumber:string; accountName:string; status:"PENDING"|"APPROVED"|"DONE"|"REJECTED"; adminNote:string|null; transferReference:string|null; approvedByUsername:string|null; processorUsername:string|null; approvedAt:string|null; processedAt:string|null; createdAt:string }
export interface AdminWalletTransaction { id:string; walletId:number; userId:number|null; username:string|null; email:string|null; transactionType:string; balanceType:string; amount:number; balanceBefore:number; balanceAfter:number; referenceId:number|null; referenceType:string|null; referenceCode:string|null; description:string|null; createdAt:string }
export interface AdminAuditLog { id:number; actorId:number; actorUsername:string; actorRole:string; action:string; targetType:string; targetId:number; oldValue:Record<string,unknown>|null; newValue:Record<string,unknown>|null; reason:string|null; ipAddress:string|null; userAgent:string|null; createdAt:string }
export interface AdminFeeConfig { id:number; feeRate:number; minFeeAmount:number; maxFeeAmount:number|null; description:string|null; isActive:boolean; effectiveFrom:string; effectiveUntil:string|null; createdBy:number; createdAt:string }
