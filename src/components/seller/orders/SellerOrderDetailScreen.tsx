"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  KeyRound,
  LoaderCircle,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { ActiveDisputeBadge, cancellationCodeLabel, OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useAppModal } from "@/components/ui/app-modal";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import {
  sellerOrderService,
  type CompleteSellerOrderItem,
  type DeliveryContentType,
} from "@/services/seller-order.service";
import type { DeliveredAsset, OrderDetail } from "@/types";

interface SellerOrderDetailScreenProps {
  orderId: number;
}

interface DeliveryDraft {
  deliveryContentType: DeliveryContentType;
  deliveryContent: string;
  sellerNotes: string;
}

const CONTENT_TYPE_OPTIONS: Array<{ value: DeliveryContentType; label: string }> = [
  { value: "ACCOUNT", label: "Tài khoản" },
  { value: "KEY", label: "Mã bản quyền / key" },
  { value: "MESSAGE", label: "Tin nhắn xác nhận" },
  { value: "OTHER", label: "Nội dung khác" },
];

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function paymentStatusLabel(status: string): string {
  if (status === "REFUNDED") return "Đã hoàn tiền";
  if (status === "PARTIALLY_REFUNDED") return "Hoàn tiền một phần";
  if (status === "PAID") return "Đã thanh toán";
  return "Chưa thanh toán";
}

function assetTypeLabel(assetType: string): string {
  if (assetType === "ACCOUNT") return "Tài khoản";
  if (assetType === "LICENSE") return "Mã bản quyền";
  if (assetType === "GIFTCARD") return "Thẻ quà tặng";
  if (assetType === "COOKIE") return "Cookie";
  return "Nội dung số";
}

function ReasonField({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        Lý do <span className="font-normal text-slate-400">(không bắt buộc)</span>
      </span>
      <textarea
        value={value}
        onChange={(event) => {
          const next = event.target.value.slice(0, 500);
          setValue(next);
          onChange(next);
        }}
        rows={3}
        maxLength={500}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        placeholder="Nhập lý do để lưu vào lịch sử đơn..."
      />
      <span className="mt-1 block text-right text-[11px] text-slate-400">{value.length}/500</span>
    </label>
  );
}

export function SellerOrderDetailScreen({ orderId }: SellerOrderDetailScreenProps) {
  const modal = useAppModal();
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${orderId}:${reloadKey}`;
  const [state, setState] = useState<{
    requestKey: string;
    order: OrderDetail | null;
    error: string | null;
  }>({ requestKey: "", order: null, error: null });
  const [isMutating, setIsMutating] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, DeliveryDraft>>({});
  const [assetState, setAssetState] = useState<{
    requestKey: string;
    assets: DeliveredAsset[];
    error: string | null;
    isLoading: boolean;
  }>({ requestKey: "", assets: [], error: null, isLoading: false });
  const [renderedAt] = useState(() => Date.now());
  const isValidOrderId = Number.isSafeInteger(orderId) && orderId > 0;
  const isLoading = isValidOrderId && state.requestKey !== requestKey;
  const order = state.order;
  const error = isValidOrderId ? state.error : "Mã định danh đơn hàng không hợp lệ.";

  useEffect(() => {
    if (!isValidOrderId) return;
    let cancelled = false;
    sellerOrderService
      .getDetail(orderId)
      .then((detail) => {
        if (cancelled) return;
        setState({ requestKey, order: detail, error: null });
        setDrafts(Object.fromEntries(detail.items.map((item) => [
          item.id,
          {
            deliveryContentType: "MESSAGE" as DeliveryContentType,
            deliveryContent: "",
            sellerNotes: "",
          },
        ])));
        if (detail.deliveryType === "INSTANT") {
          setAssetState({ requestKey, assets: [], error: null, isLoading: true });
          sellerOrderService
            .getDeliveredAssets(orderId)
            .then((assets) => {
              if (!cancelled) setAssetState({ requestKey, assets, error: null, isLoading: false });
            })
            .catch((assetError: unknown) => {
              if (!cancelled) {
                setAssetState({
                  requestKey,
                  assets: [],
                  error: getApiErrorMessage(assetError, "Không thể tải thông tin tài khoản đã giao"),
                  isLoading: false,
                });
              }
            });
        } else {
          setAssetState({ requestKey, assets: [], error: null, isLoading: false });
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState({
            requestKey,
            order: null,
            error: getApiErrorMessage(requestError, "Không thể tải chi tiết đơn hàng"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isValidOrderId, orderId, requestKey]);

  function reloadOrder() {
    setReloadKey((current) => current + 1);
  }

  async function copyAssetContent(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      modal.showSuccess({ title: "Đã sao chép thông tin tài khoản" });
    } catch {
      modal.showError({ title: "Không thể sao chép", description: "Trình duyệt không cho phép truy cập clipboard." });
    }
  }

  async function updateOrder(action: "accept" | "reject" | "cancel") {
    if (!order || isMutating) return;
    let reason = "";
    const destructive = action !== "accept";
    const confirmed = await modal.confirm({
      title: action === "accept"
        ? "Nhận đơn đặt hàng?"
        : action === "reject"
          ? "Từ chối và hoàn tiền?"
          : "Hủy đơn đang thực hiện?",
      description: action === "accept"
        ? "Sau khi nhận, shop phải giao đầy đủ nội dung trước thời hạn xử lý."
        : `Hệ thống sẽ hoàn ${formatCurrency(Number(order.totalAmount))} về ví người mua.`,
      details: destructive ? <ReasonField onChange={(value) => { reason = value; }} /> : undefined,
      confirmLabel: action === "accept" ? "Nhận đơn" : action === "reject" ? "Từ chối & hoàn tiền" : "Hủy & hoàn tiền",
      cancelLabel: "Quay lại",
      danger: destructive,
    });
    if (!confirmed) return;

    setIsMutating(true);
    try {
      if (action === "accept") await sellerOrderService.accept(order.id);
      else if (action === "reject") await sellerOrderService.reject(order.id, reason);
      else await sellerOrderService.cancel(order.id, reason);
      modal.showSuccess({
        title: action === "accept" ? "Đã nhận đơn" : "Đã hủy và hoàn tiền",
      });
      reloadOrder();
    } catch (requestError: unknown) {
      modal.showError({
        title: "Không thể cập nhật đơn hàng",
        description: getApiErrorMessage(requestError),
      });
      reloadOrder();
    } finally {
      setIsMutating(false);
    }
  }

  async function completeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order || isMutating) return;
    const items: CompleteSellerOrderItem[] = order.items.map((item) => ({
      orderItemId: item.id,
      deliveryContentType: drafts[item.id]?.deliveryContentType ?? "MESSAGE",
      deliveryContent: drafts[item.id]?.deliveryContent.trim() ?? "",
      sellerNotes: drafts[item.id]?.sellerNotes.trim() || undefined,
    }));
    const missingItem = items.find((item) => !item.deliveryContent);
    if (missingItem) {
      modal.showError({
        title: "Thiếu nội dung giao hàng",
        description: "Mỗi dòng sản phẩm phải có nội dung giao riêng cho người mua.",
      });
      return;
    }
    const confirmed = await modal.confirm({
      title: "Hoàn thành và giao đơn?",
      description: "Nội dung này sẽ được lưu làm bản giao hàng để người mua xem lại.",
      confirmLabel: "Xác nhận giao đơn",
      cancelLabel: "Kiểm tra lại",
    });
    if (!confirmed) return;

    setIsMutating(true);
    try {
      await sellerOrderService.complete(order.id, items);
      modal.showSuccess({
        title: "Đã hoàn thành đơn hàng",
        description: "Tiền vẫn được tạm giữ trong thời gian đối soát/khiếu nại của người mua.",
      });
      reloadOrder();
    } catch (requestError: unknown) {
      modal.showError({
        title: "Không thể hoàn thành đơn",
        description: getApiErrorMessage(requestError),
      });
      reloadOrder();
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading && !order) {
    return (
      <div className="grid min-h-[520px] place-items-center text-sm font-semibold text-slate-500">
        <span className="inline-flex items-center gap-2"><LoaderCircle className="size-5 animate-spin text-violet-600" />Đang tải chi tiết đơn...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto grid min-h-[520px] max-w-2xl place-items-center px-5 text-center">
        <div>
          <AlertCircle className="mx-auto size-12 text-rose-500" />
          <h1 className="mt-4 text-xl font-black text-slate-950">Không thể mở đơn hàng</h1>
          <p className="mt-2 text-sm text-slate-500">{error ?? "Không tìm thấy đơn hàng."}</p>
          <Link href="/seller/orders" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white">
            <ArrowLeft className="size-4" /> Về danh sách đơn
          </Link>
        </div>
      </div>
    );
  }

  const deadline = order.status === "WAITING_SELLER_ACCEPTANCE"
    ? order.approvalDeadlineAt
    : order.status === "PROCESSING"
      ? order.processingDeadlineAt
      : null;
  const deadlineExpired = Boolean(deadline && new Date(deadline).getTime() <= renderedAt);

  return (
    <div className="mx-auto w-full max-w-[1350px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/seller/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-violet-700">
          <ArrowLeft className="size-4" /> Tất cả đơn hàng
        </Link>
        <button type="button" onClick={reloadOrder} disabled={isLoading || isMutating} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:text-violet-700 disabled:opacity-50">
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /> Làm mới
        </button>
      </div>

      <header className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">Chi tiết đơn bán</p>
            <h1 className="mt-2 break-all text-xl font-black text-slate-950 sm:text-2xl">{order.orderCode}</h1>
            <p className="mt-2 text-sm text-slate-500">Đặt lúc {formatDateTime(order.placedAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} cancelledBy={order.cancelledBy} />
            {order.activeDispute ? <ActiveDisputeBadge /> : null}
          </div>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><UserRound className="size-4" /> Người mua</dt>
            <dd className="mt-1 font-black text-slate-900">@{order.buyerUsername || "không xác định"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><PackageCheck className="size-4" /> Loại đơn</dt>
            <dd className="mt-1 font-black text-slate-900">{order.deliveryType === "PRE_ORDER" ? "Đặt hàng" : "Giao ngay"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><WalletCards className="size-4" /> Thanh toán</dt>
            <dd className="mt-1 font-black text-slate-900">{paymentStatusLabel(order.paymentStatus)}</dd>
          </div>
          <div className="rounded-xl bg-violet-50 p-3">
            <dt className="text-xs font-bold text-violet-600">Tổng tiền</dt>
            <dd className="mt-1 text-lg font-black text-violet-800">{formatCurrency(Number(order.totalAmount))}</dd>
          </div>
        </dl>

        {deadline ? (
          <div className={`mt-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${deadlineExpired ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            <Clock3 className="mt-0.5 size-4 shrink-0" />
            <p><span className="font-black">{deadlineExpired ? "Đã quá hạn:" : "Thời hạn:"}</span> {formatDateTime(deadline)}{deadlineExpired ? " — chờ hệ thống tự hủy và hoàn tiền." : ""}</p>
          </div>
        ) : null}

        {order.rejectionReason ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            <span className="font-black">Lý do từ chối:</span> {order.rejectionReason}
          </div>
        ) : null}

        {order.status === "CANCELLED" ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
            <p className="font-black">Thông tin hủy đơn</p>
            <p className="mt-1"><span className="font-bold">Loại:</span> {cancellationCodeLabel(order.cancellationCode)}</p>
            <p className="mt-1"><span className="font-bold">Thời gian:</span> {formatDateTime(order.cancelledAt)}</p>
            <p className="mt-1"><span className="font-bold">Lý do:</span> {order.cancellationReason || "Không có ghi chú thêm."}</p>
          </div>
        ) : null}

        {order.deliveryType === "PRE_ORDER" && order.status === "WAITING_SELLER_ACCEPTANCE" ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => void updateOrder("accept")} disabled={isLoading || isMutating || deadlineExpired} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isMutating ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Nhận đơn
            </button>
            <button type="button" onClick={() => void updateOrder("reject")} disabled={isLoading || isMutating || deadlineExpired} className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 px-5 text-sm font-black text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
              <XCircle className="size-4" /> Từ chối & hoàn tiền
            </button>
          </div>
        ) : null}

        {order.deliveryType === "PRE_ORDER" && order.status === "PROCESSING" ? (
          <div className="mt-5">
            <button type="button" onClick={() => void updateOrder("cancel")} disabled={isLoading || isMutating || deadlineExpired} className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 px-5 text-sm font-black text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
              <XCircle className="size-4" /> Hủy đơn & hoàn tiền
            </button>
          </div>
        ) : null}
      </header>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="font-black text-slate-950">Sản phẩm trong đơn</h2>
          <p className="mt-1 text-xs text-slate-500">Thông tin được snapshot tại thời điểm người mua thanh toán.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <article key={item.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{item.productName}</h3>
                  <p className="mt-1 text-sm text-slate-500">Biến thể: {item.variantName} · Số lượng: {item.quantity}</p>
                </div>
                <p className="font-black text-slate-900">{formatCurrency(Number(item.lineTotal))}</p>
              </div>

              {item.preOrder ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.06em] text-amber-700"><MessageSquareText className="size-4" /> Thông tin người mua gửi shop</p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.preOrder.buyerInputs?.trim() || "Người mua không nhập thêm thông tin."}</p>
                  </div>
                  {item.preOrder.deliveryContent ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                      <p className="text-xs font-black uppercase tracking-[0.06em] text-emerald-700">Nội dung shop đã giao</p>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.preOrder.deliveryContent}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {order.deliveryType === "INSTANT" ? (
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <KeyRound className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-950">Thông tin tài khoản đã bán</h2>
              <p className="mt-1 text-xs text-slate-500">Bản chụp nội dung hệ thống đã giao cho người mua trong đơn này.</p>
            </div>
          </div>

          {assetState.isLoading || assetState.requestKey !== requestKey ? (
            <div className="flex min-h-28 items-center justify-center gap-2 px-5 py-8 text-sm font-semibold text-slate-500">
              <LoaderCircle className="size-5 animate-spin text-violet-600" /> Đang tải thông tin tài khoản...
            </div>
          ) : assetState.error ? (
            <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {assetState.error}
            </div>
          ) : assetState.assets.length ? (
            <div className="divide-y divide-slate-100">
              {assetState.assets.map((asset, index) => {
                const item = order.items.find((orderItem) => orderItem.id === asset.orderItemId);
                return (
                  <article key={`${asset.id}-${asset.orderItemId}`} className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {assetTypeLabel(asset.assetType)} #{index + 1}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item ? `${item.productName} — ${item.variantName}` : `Dòng đơn #${asset.orderItemId}`}
                          {asset.deliveredAt ? ` · Đã giao ${formatDateTime(asset.deliveredAt)}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyAssetContent(asset.content)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Copy className="size-3.5" /> Sao chép
                      </button>
                    </div>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-emerald-300">
                      {asset.content}
                    </pre>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
              Không tìm thấy bản ghi tài khoản đã giao của đơn này.
            </p>
          )}
        </section>
      ) : null}

      {order.deliveryType === "PRE_ORDER" && order.status === "PROCESSING" ? (
        <form id="complete-order" onSubmit={completeOrder} className="mt-5 scroll-mt-24 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-slate-950">Hoàn thành đơn đặt hàng</h2>
          <p className="mt-1 text-sm text-slate-500">Nhập nội dung giao riêng cho từng dòng. Đây là dữ liệu người mua sẽ xem lại sau khi hoàn thành.</p>

          <div className="mt-5 space-y-4">
            {order.items.map((item) => {
              const draft = drafts[item.id] ?? { deliveryContentType: "MESSAGE" as DeliveryContentType, deliveryContent: "", sellerNotes: "" };
              return (
                <fieldset key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <legend className="px-2 text-sm font-black text-slate-900">{item.productName} — {item.variantName}</legend>
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-600">Loại nội dung giao *</span>
                      <select value={draft.deliveryContentType} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, deliveryContentType: event.target.value as DeliveryContentType } }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
                        {CONTENT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-600">Nội dung giao cho người mua *</span>
                      <textarea required maxLength={10000} rows={4} value={draft.deliveryContent} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, deliveryContent: event.target.value } }))} placeholder="Nhập tài khoản, key hoặc nội dung xác nhận đã hoàn tất dịch vụ..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
                      <span className="mt-1 block text-right text-[11px] text-slate-400">{draft.deliveryContent.length}/10000</span>
                    </label>
                  </div>
                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">Ghi chú nội bộ <span className="font-normal text-slate-400">(người mua không nhìn thấy)</span></span>
                    <textarea maxLength={2000} rows={2} value={draft.sellerNotes} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, sellerNotes: event.target.value } }))} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
                  </label>
                </fieldset>
              );
            })}
          </div>

          <button type="submit" disabled={isLoading || isMutating || deadlineExpired} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isMutating ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Hoàn thành và giao đơn
          </button>
        </form>
      ) : null}

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-black text-slate-950">Lịch sử trạng thái</h2>
        {order.statusLogs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Chưa có lịch sử trạng thái.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {order.statusLogs.map((log) => (
              <li key={log.id} className="flex gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-violet-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800"><OrderStatusBadge status={log.toStatus} /></p>
                  {log.note ? <p className="mt-1 text-sm leading-6 text-slate-600">{log.note}</p> : null}
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
