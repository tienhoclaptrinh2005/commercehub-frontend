"use client";

import {
  CalendarClock,
  CirclePause,
  CirclePlay,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  TicketPercent,
  X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { sellerProductService } from "@/services/seller-product.service";
import { voucherService } from "@/services/voucher.service";
import type { PageResponse, SellerProductListItem, Voucher, VoucherDiscountType, VoucherPayload } from "@/types";

const EMPTY_PAGE: PageResponse<Voucher> = {
  currentPage: 0,
  pageSize: 20,
  totalPages: 0,
  totalElements: 0,
  data: [],
};

const PRODUCT_PAGE_SIZE = 50;

async function loadAllSellerProducts(): Promise<SellerProductListItem[]> {
  const firstPage = await sellerProductService.getMyProducts({
    page: 0,
    size: PRODUCT_PAGE_SIZE,
  });
  if (firstPage.totalPages <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      sellerProductService.getMyProducts({
        page: index + 1,
        size: PRODUCT_PAGE_SIZE,
      }),
    ),
  );
  return [firstPage, ...remainingPages].flatMap((productPage) => productPage.data);
}

const STATUS_LABEL: Record<Voucher["status"], string> = {
  ACTIVE: "Đang áp dụng",
  SCHEDULED: "Sắp diễn ra",
  PAUSED: "Đã tạm dừng",
  EXHAUSTED: "Hết lượt",
  EXPIRED: "Hết hạn",
};

function localDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function initialForm(): VoucherFormState {
  const starts = new Date();
  const expires = new Date(starts);
  expires.setDate(expires.getDate() + 30);
  return {
    code: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "10",
    maxDiscountAmount: "50000",
    minOrderAmount: "50000",
    applyAllProducts: true,
    productIds: [],
    startsAt: localDateTime(starts),
    expiresAt: localDateTime(expires),
    usageLimit: "100",
  };
}

interface VoucherFormState {
  code: string;
  description: string;
  discountType: VoucherDiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  minOrderAmount: string;
  applyAllProducts: boolean;
  productIds: number[];
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
}

export function SellerVouchersScreen() {
  const modal = useAppModal();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(EMPTY_PAGE);
  const [products, setProducts] = useState<SellerProductListItem[]>([]);
  const [loadedRequestKey, setLoadedRequestKey] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherFormState>(initialForm);

  const requestKey = `${search}:${page}:${reloadKey}`;
  const loading = loadedRequestKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
        voucherService.listSeller(search, page, 20),
        loadAllSellerProducts(),
      ])
      .then(([vouchers, sellerProducts]) => {
        if (cancelled) return;
        setData(vouchers);
        setProducts(sellerProducts);
        setLoadedRequestKey(requestKey);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadedRequestKey(requestKey);
      modal.showError({
        title: "Không thể tải mã giảm giá",
        description: getApiErrorMessage(error),
        confirmLabel: "Đã hiểu",
      });
      });
    return () => { cancelled = true; };
  }, [modal, page, requestKey, search]);

  const selectedProducts = useMemo(
    () => products.filter((product) => form.productIds.includes(product.id)),
    [form.productIds, products],
  );

  function openCreate() {
    setEditing(null);
    setForm(initialForm());
    setFormOpen(true);
  }

  function openEdit(voucher: Voucher) {
    setEditing(voucher);
    setForm({
      code: voucher.code,
      description: voucher.description ?? "",
      discountType: voucher.discountType,
      discountValue: String(voucher.discountValue),
      maxDiscountAmount: voucher.maxDiscountAmount == null ? "" : String(voucher.maxDiscountAmount),
      minOrderAmount: String(voucher.minOrderAmount),
      applyAllProducts: voucher.applyAllProducts,
      productIds: voucher.productIds,
      startsAt: localDateTime(new Date(voucher.startsAt)),
      expiresAt: localDateTime(new Date(voucher.expiresAt)),
      usageLimit: String(voucher.usageLimit),
    });
    setFormOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!form.applyAllProducts && form.productIds.length === 0) {
      modal.showError({ title: "Chưa chọn sản phẩm", description: "Hãy chọn ít nhất một sản phẩm áp dụng.", confirmLabel: "Đã hiểu" });
      return;
    }
    const payload: VoucherPayload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.discountType === "PERCENT" && form.maxDiscountAmount
        ? Number(form.maxDiscountAmount) : undefined,
      minOrderAmount: Number(form.minOrderAmount),
      applyAllProducts: form.applyAllProducts,
      productIds: form.applyAllProducts ? [] : form.productIds,
      startsAt: new Date(form.startsAt).toISOString(),
      expiresAt: new Date(form.expiresAt).toISOString(),
      usageLimit: Number(form.usageLimit),
    };
    setSaving(true);
    try {
      if (editing) await voucherService.update(editing.id, payload);
      else await voucherService.create(payload);
      setFormOpen(false);
      setReloadKey((current) => current + 1);
      modal.showSuccess({
        title: editing ? "Đã cập nhật mã giảm giá" : "Đã tạo mã giảm giá",
        description: `${payload.code} đã sẵn sàng theo thời gian bạn cấu hình.`,
        confirmLabel: "Hoàn tất",
      });
    } catch (error) {
      modal.showError({ title: "Không thể lưu mã", description: getApiErrorMessage(error), confirmLabel: "Đã hiểu" });
    } finally {
      setSaving(false);
    }
  }

  async function toggle(voucher: Voucher) {
    try {
      await voucherService.setActive(voucher.id, !voucher.active);
      setReloadKey((current) => current + 1);
    } catch (error) {
      modal.showError({ title: "Không thể đổi trạng thái", description: getApiErrorMessage(error), confirmLabel: "Đã hiểu" });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-700">Khuyến mại của gian hàng</p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">Mã giảm giá</h1>
          <p className="mt-2 text-sm text-slate-500">Tạo voucher do gian hàng tài trợ; phí sàn được tính trên giá sau giảm.</p>
        </div>
        <button onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700">
          <Plus className="size-4" /> Tạo mã mới
        </button>
      </header>

      <form onSubmit={(event) => { event.preventDefault(); setPage(0); setSearch(keyword.trim()); }} className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo mã hoặc mô tả..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-violet-500" />
        </div>
        <button className="rounded-xl bg-slate-900 px-5 text-sm font-bold text-white">Tìm kiếm</button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="grid min-h-56 place-items-center text-sm font-semibold text-slate-500"><LoaderCircle className="mr-2 inline size-5 animate-spin" />Đang tải...</div>
        ) : data.data.length === 0 ? (
          <div className="grid min-h-56 place-items-center px-4 text-center"><div><TicketPercent className="mx-auto size-10 text-violet-300" /><p className="mt-3 font-bold text-slate-700">Chưa có mã giảm giá</p><p className="mt-1 text-sm text-slate-500">Tạo mã đầu tiên để buyer áp dụng khi thanh toán.</p></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.05em] text-slate-500"><tr><th className="px-5 py-4">Mã</th><th className="px-5 py-4">Ưu đãi</th><th className="px-5 py-4">Điều kiện</th><th className="px-5 py-4">Đã dùng</th><th className="px-5 py-4">Hiệu lực</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><p className="font-black text-violet-700">{voucher.code}</p><p className="mt-1 max-w-52 truncate text-xs text-slate-400">{voucher.description || "Không có mô tả"}</p></td>
                    <td className="px-5 py-4 font-bold text-slate-800">{voucher.discountType === "PERCENT" ? `${voucher.discountValue}%${voucher.maxDiscountAmount ? ` · tối đa ${formatCurrency(voucher.maxDiscountAmount)}` : ""}` : formatCurrency(voucher.discountValue)}</td>
                    <td className="px-5 py-4"><p>Từ {formatCurrency(voucher.minOrderAmount)}</p><p className="mt-1 text-xs text-slate-400">{voucher.applyAllProducts ? "Tất cả sản phẩm" : `${voucher.productIds.length} sản phẩm`}</p></td>
                    <td className="px-5 py-4 font-bold">{voucher.usedCount}/{voucher.usageLimit}</td>
                    <td className="px-5 py-4 text-xs text-slate-500"><p>{new Date(voucher.startsAt).toLocaleString("vi-VN")}</p><p>đến {new Date(voucher.expiresAt).toLocaleString("vi-VN")}</p></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${voucher.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : voucher.status === "SCHEDULED" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{STATUS_LABEL[voucher.status]}</span></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(voucher)} title="Chỉnh sửa" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"><Pencil className="size-4" /></button><button onClick={() => void toggle(voucher)} title={voucher.active ? "Tạm dừng" : "Kích hoạt"} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700">{voucher.active ? <CirclePause className="size-4" /> : <CirclePlay className="size-4" />}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.totalPages > 1 ? <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm"><span className="text-slate-500">{data.totalElements} mã giảm giá</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Trước</button><button disabled={page + 1 >= data.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Sau</button></div></div> : null}
      </section>

      {formOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 max-w-3xl rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-violet-700">{editing ? "Chỉnh sửa" : "Tạo mới"}</p><h2 className="mt-1 text-2xl font-black text-slate-950">Cấu hình mã giảm giá</h2></div><button onClick={() => setFormOpen(false)} className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500"><X className="size-5" /></button></header>
            <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mã voucher"><input required minLength={3} maxLength={50} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="field" placeholder="SALE10" /></Field>
                <Field label="Mô tả"><input maxLength={255} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="field" placeholder="Giảm giá tháng này" /></Field>
                <Field label="Loại giảm"><select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as VoucherDiscountType })} className="field"><option value="PERCENT">Theo phần trăm</option><option value="FIXED">Số tiền cố định</option></select></Field>
                <Field label={form.discountType === "PERCENT" ? "Phần trăm giảm" : "Số tiền giảm"}><input required type="number" min="1" max={form.discountType === "PERCENT" ? "99" : undefined} value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} className="field" /></Field>
                {form.discountType === "PERCENT" ? <Field label="Giảm tối đa"><input type="number" min="1" value={form.maxDiscountAmount} onChange={(event) => setForm({ ...form, maxDiscountAmount: event.target.value })} className="field" /></Field> : null}
                <Field label="Đơn tối thiểu"><input required type="number" min="0" value={form.minOrderAmount} onChange={(event) => setForm({ ...form, minOrderAmount: event.target.value })} className="field" /></Field>
                <Field label="Tổng lượt sử dụng"><input required type="number" min={Math.max(1, editing?.usedCount ?? 1)} value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} className="field" /></Field>
                <Field label="Bắt đầu"><input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="field" /></Field>
                <Field label="Kết thúc"><input required type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className="field" /></Field>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4"><label className="flex items-center gap-3 font-bold text-slate-800"><input type="checkbox" checked={form.applyAllProducts} onChange={(event) => setForm({ ...form, applyAllProducts: event.target.checked, productIds: event.target.checked ? [] : form.productIds })} className="size-4 accent-violet-600" />Áp dụng cho tất cả sản phẩm</label>{!form.applyAllProducts ? <div className="mt-4 max-h-52 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">{products.map((product) => <label key={product.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm"><input type="checkbox" checked={form.productIds.includes(product.id)} onChange={(event) => setForm((current) => ({ ...current, productIds: event.target.checked ? [...current.productIds, product.id] : current.productIds.filter((id) => id !== product.id) }))} className="size-4 accent-violet-600" /><span className="font-semibold">{product.name}</span><span className="ml-auto text-xs text-slate-400">{product.deliveryType === "INSTANT" ? "Giao ngay" : "Đặt hàng"}</span></label>)}</div> : null}{!form.applyAllProducts && selectedProducts.length > 0 ? <p className="mt-2 text-xs text-violet-700">Đã chọn {selectedProducts.length} sản phẩm</p> : null}</div>
              {editing && editing.usedCount > 0 ? <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"><CalendarClock className="mr-2 inline size-4" />Mã đã có lượt dùng: không thể đổi mã, giá trị giảm, điều kiện hoặc phạm vi sản phẩm.</p> : null}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setFormOpen(false)} className="h-11 rounded-xl border border-slate-200 px-5 font-bold text-slate-600">Hủy</button><button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-6 font-black text-white disabled:opacity-50">{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}{editing ? "Lưu thay đổi" : "Tạo mã"}</button></div>
            </form>
          </div>
        </div>
      ) : null}
      <style jsx>{`.field{height:2.75rem;width:100%;border-radius:.75rem;border:1px solid rgb(226 232 240);padding:0 .75rem;font-size:.875rem;outline:none}.field:focus{border-color:rgb(124 58 237);box-shadow:0 0 0 3px rgb(124 58 237/.08)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-2"><span className="text-xs font-black uppercase tracking-[0.05em] text-slate-600">{label}</span>{children}</label>;
}
