"use client";

import { useEffect, useState } from "react";

import { sellerDashboardService } from "@/services/seller-dashboard.service";

const POLLING_INTERVAL_MS = 30_000;

/**
 * Đồng bộ số yêu cầu đặt hàng mới từ database. Chỉ polling khi tab đang hiển thị
 * để không tạo request thừa lúc Seller chuyển sang ứng dụng khác.
 */
export function useSellerNotifications() {
  const [newPreOrderRequestCount, setNewPreOrderRequestCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const data = await sellerDashboardService.getNotifications();
        if (active) setNewPreOrderRequestCount(data.newPreOrderRequestCount);
      } catch {
        // Giữ số gần nhất; lỗi dashboard chính vẫn được hiển thị ở màn hình.
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refresh();
    }

    void refresh();
    const intervalId = window.setInterval(refreshWhenVisible, POLLING_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return newPreOrderRequestCount;
}
