"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clipboard,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Scale,
  Store,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useOrder } from "@/hooks/api/useOrder";
import { formatCurrency } from "@/lib/format";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function readableStatus(status: string): string {
  const labels: Record<string, string> = {
    WAITING_APPROVAL: "Chờ shop xác nhận",
    PROCESSING: "Đang xử lý",
    DELIVERED: "Đã giao hàng",
    REJECTED: "Shop từ chối",
    REFUNDED: "Đã hoàn tiền",
    CANCELLED: "Đã hủy",
    CANCELLED_BY_SELLER: "Shop đã hủy",
    CANCELLED_BY_SYSTEM: "Hệ thống đã hủy",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

export function OrderDetailScreen({ orderCode }: { orderCode: string }) {
  const { order, assets, error, isLoading, refresh } = useOrder(orderCode);
  const [revealedAssets, setRevealedAssets] = useState<Set<number>>(new Set());
  const [revealedPreOrders, setRevealedPreOrders] = useState<Set<number>>(new Set());
  const [copiedAssetId, setCopiedAssetId] = useState<number | null>(null);

  const assetsByItem = useMemo(() => {
    const grouped = new Map<number, typeof assets>();
    for (const asset of assets) {
      const current = grouped.get(asset.orderItemId) ?? [];
      current.push(asset);
      grouped.set(asset.orderItemId, current);
    }
    return grouped;
  }, [assets]);

  function toggleAsset(assetId: number) {
    setRevealedAssets((current) => {
      const next = new Set(current);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  }

  function togglePreOrder(itemId: number) {
    setRevealedPreOrders((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function copyAsset(assetId: number, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedAssetId(assetId);
    window.setTimeout(() => setCopiedAssetId(null), 1600);
  }

  function downloadInstantOrder() {
    if (!order || assets.length === 0) return;

    const body = [
      `COMMERCEHUB - ${order.orderCode}`,
      `Shop: ${order.shopName}`,
      `Ngày mua: ${formatDateTime(order.placedAt)}`,
      "",
      ...assets.flatMap((asset, index) => [
        `===== SẢN PHẨM GIAO #${index + 1} (${asset.assetType}) =====`,
        asset.content,
        "",
      ]),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${order.orderCode.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[520px] max-w-[1200px] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          Đang tải chi tiết đơn hàng...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm">
          <AlertCircle className="mx-auto size-12 text-rose-500" />
          <h1 className="mt-4 text-xl font-black text-slate-900">Không thể mở đơn hàng</h1>
          <p className="mt-2 text-sm text-rose-700">{error ?? "Không tìm thấy đơn hàng."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/orders" className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700">
              Quay lại
            </Link>
            <button type="button" onClick={refresh} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white">
              <RefreshCw className="size-4" /> Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInstant = order.deliveryType === "INSTANT";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-emerald-700">
        <ArrowLeft className="size-4" /> Lịch sử đơn hàng
      </Link>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-100 p-5 sm:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-950">{order.orderCode}</h1>
              <OrderStatusBadge status={order.effectiveStatus || order.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">Đặt lúc {formatDateTime(order.placedAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isInstant && assets.length > 0 ? (
              <button
                type="button"
                onClick={downloadInstantOrder}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
              >
                <Download className="size-4" /> Tải file TXT
              </button>
            ) : null}
            <button
              type="button"
              onClick={refresh}
              className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:text-emerald-700"
              aria-label="Tải lại đơn hàng"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 bg-slate-50/70 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-7">
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <Store className="size-5 text-emerald-600" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Người bán</p>
              <Link
                href={`/users/${encodeURIComponent(order.sellerUsername)}`}
                className="mt-0.5 block truncate font-bold text-slate-800 transition hover:text-emerald-700 hover:underline"
              >
                {order.shopName}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            {isInstant ? <PackageCheck className="size-5 text-sky-600" /> : <Clock3 className="size-5 text-amber-600" />}
            <div><p className="text-xs text-slate-400">Loại đơn</p><p className="mt-0.5 font-bold text-slate-800">{isInstant ? "Giao ngay" : "Đặt hàng"}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <WalletCards className="size-5 text-violet-600" />
            <div><p className="text-xs text-slate-400">Thanh toán</p><p className="mt-0.5 font-bold text-slate-800">{order.paymentStatus === "PAID" ? "Đã thanh toán" : readableStatus(order.paymentStatus)}</p></div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Tổng tiền</p>
            <p className="mt-1 text-lg font-black text-emerald-700">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">Sản phẩm trong đơn</h2>
            <span className="text-sm font-semibold text-slate-500">{order.items.length} dòng</span>
          </div>

          {order.items.map((item) => {
            const itemAssets = assetsByItem.get(item.id) ?? [];
            const preOrderRevealed = revealedPreOrders.has(item.id);

            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Item #{item.id}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">{item.productName}</h3>
                    <p className="mt-1 text-sm text-slate-500">Phân loại: {item.variantName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    <p className="mt-1 font-black text-emerald-700">{formatCurrency(item.lineTotal)}</p>
                  </div>
                </div>

                {isInstant ? (
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                    <h4 className="flex items-center gap-2 text-sm font-black text-slate-800"><FileText className="size-4 text-emerald-600" /> Nội dung đã giao</h4>
                    {itemAssets.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có nội dung giao hàng cho sản phẩm này.</p>
                    ) : itemAssets.map((asset, index) => {
                      const revealed = revealedAssets.has(asset.id);
                      return (
                        <div key={asset.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Dữ liệu #{index + 1} · {asset.assetType}</p>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => toggleAsset(asset.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-slate-700 shadow-sm">
                                {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                {revealed ? "Ẩn" : "Hiện"}
                              </button>
                              <button type="button" onClick={() => void copyAsset(asset.id, asset.content)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-emerald-700 shadow-sm">
                                {copiedAssetId === asset.id ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
                                {copiedAssetId === asset.id ? "Đã chép" : "Sao chép"}
                              </button>
                            </div>
                          </div>
                          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-100">
                            {revealed ? asset.content : "••••••••••••••••••••••••"}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                ) : item.preOrder ? (
                  <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      <p className="font-black">Yêu cầu đã gửi shop</p>
                      <p className="mt-1 whitespace-pre-wrap">{item.preOrder.buyerInputs || "Không có ghi chú."}</p>
                    </div>
                    {item.preOrder.deliveryContent ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-emerald-900">Nội dung shop đã giao</p>
                          <button type="button" onClick={() => togglePreOrder(item.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-emerald-700">
                            {preOrderRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            {preOrderRevealed ? "Ẩn" : "Hiện"}
                          </button>
                        </div>
                        <pre className="mt-3 whitespace-pre-wrap break-all rounded-lg bg-white p-3 text-xs leading-6 text-slate-800">
                          {preOrderRevealed ? item.preOrder.deliveryContent : "••••••••••••••••••••••••"}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="text-xs leading-5 text-slate-500">
                    {item.disputeId ? (
                      <span>Item này đã có khiếu nại #{item.disputeId}.</span>
                    ) : item.complaintAllowed && item.complaintDeadlineAt ? (
                      <span>Có thể khiếu nại đến {formatDateTime(item.complaintDeadlineAt)}.</span>
                    ) : item.complaintDeadlineAt ? (
                      <span>Thời hạn khiếu nại T+7 đã kết thúc.</span>
                    ) : (
                      <span>Khiếu nại mở sau khi sản phẩm được giao và tiền đang tạm giữ.</span>
                    )}
                  </div>
                  {item.disputeId ? (
                    <Link href={`/disputes/${item.disputeId}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-black text-violet-700">
                      <Scale className="size-4" /> Xem khiếu nại
                    </Link>
                  ) : item.complaintAllowed ? (
                    <Link href={`/orders/${encodeURIComponent(order.orderCode)}/items/${item.id}/complain`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100">
                      <Scale className="size-4" /> Khiếu nại đơn hàng
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
          <h2 className="text-lg font-black text-slate-950">Tóm tắt thanh toán</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-slate-500"><dt>Tạm tính</dt><dd className="font-bold text-slate-800">{formatCurrency(order.subtotalAmount)}</dd></div>
            <div className="flex justify-between gap-4 text-slate-500"><dt>Giảm giá</dt><dd className="font-bold text-slate-800">-{formatCurrency(order.voucherDiscount)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-4"><dt className="font-black text-slate-800">Tổng cộng</dt><dd className="text-lg font-black text-emerald-700">{formatCurrency(order.totalAmount)}</dd></div>
          </dl>

          {order.statusLogs.length > 0 ? (
            <div className="mt-7 border-t border-slate-100 pt-5">
              <h3 className="font-black text-slate-900">Tiến trình đơn hàng</h3>
              <ol className="mt-4 space-y-4">
                {order.statusLogs.map((log) => (
                  <li key={log.id} className="relative border-l-2 border-emerald-100 pl-4">
                    <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-bold text-slate-800">{readableStatus(log.toStatus)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
                    {log.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{log.note}</p> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
