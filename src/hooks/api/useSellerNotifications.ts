"use client";

import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  sellerDashboardService,
  type SellerNotificationCategory,
} from "@/services/seller-dashboard.service";
import type { SellerNotificationData } from "@/types";

const POLLING_INTERVAL_MS = 30_000;

interface SellerNotificationsContextValue {
  data: SellerNotificationData | null;
  refresh: () => Promise<void>;
  markRead: (category: SellerNotificationCategory) => Promise<void>;
}

const SellerNotificationsContext = createContext<SellerNotificationsContextValue | null>(null);

/**
 * Đồng bộ các badge công việc của seller từ database. Chỉ polling khi tab đang
 * hiển thị để không tạo request thừa lúc Seller chuyển sang ứng dụng khác.
 */
export function SellerNotificationsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SellerNotificationData | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData(await sellerDashboardService.getNotifications());
    } catch {
      // Giữ số gần nhất nếu một lần polling tạm thời thất bại.
    }
  }, []);

  const markRead = useCallback(async (category: SellerNotificationCategory) => {
    setData(await sellerDashboardService.markNotificationsRead(category));
  }, []);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refresh();
    }

    const initialRefreshId = window.setTimeout(refreshWhenVisible, 0);
    const intervalId = window.setInterval(refreshWhenVisible, POLLING_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  const value = useMemo(() => ({ data, refresh, markRead }), [data, refresh, markRead]);

  return createElement(SellerNotificationsContext.Provider, { value }, children);
}

export function useSellerNotifications() {
  const context = useOptionalSellerNotifications();
  if (!context) {
    throw new Error("useSellerNotifications phải được dùng trong SellerNotificationsProvider");
  }
  return context;
}

export function useOptionalSellerNotifications() {
  return useContext(SellerNotificationsContext);
}
