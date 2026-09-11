"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  PackagePlus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { getApiErrorMessage } from "@/services/api";
import { sellerProductService } from "@/services/seller-product.service";
import type { DigitalAsset, ProductSummary, SliceResponse } from "@/types";

const PAGE_SIZE = 20;
const MAX_IMPORT_LINES = 500;
const MAX_LINE_LENGTH = 10_000;
const MAX_TXT_BYTES = 2 * 1024 * 1024;

const EMPTY_INVENTORY: SliceResponse<DigitalAsset> = {
  currentPage: 0,
  pageSize: PAGE_SIZE,
  hasNext: false,
  hasPrevious: false,
  pageNumbers: [],
  data: [],
};

function parseLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function inventoryIdentifier(line: string, productType: string | undefined) {
  if (productType !== "ACCOUNT") return line;
  const separatorIndex = line.indexOf("|");
  return (separatorIndex >= 0 ? line.slice(0, separatorIndex) : line).trim().toLowerCase();
}

function safeFilePart(value: string) {
  return value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "inventory";
}

export function SellerProductInventoryScreen({ productId }: { productId: number }) {
  const modal = useAppModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [inventory, setInventory] = useState(EMPTY_INVENTORY);
  const [page, setPage] = useState(0);
  const [inventoryText, setInventoryText] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedProductKey, setLoadedProductKey] = useState(-1);
  const [loadedInventoryKey, setLoadedInventoryKey] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadProduct = useCallback(
    () => sellerProductService.getProduct(productId),
    [productId],
  );

  const inventoryRequestKey = `${selectedVariantId ?? "none"}:${page}:${reloadKey}`;
  const inventoryEnabled = selectedVariantId != null && product?.deliveryType === "INSTANT";
  const isLoadingProduct = loadedProductKey !== reloadKey;
  const isLoadingInventory = inventoryEnabled && loadedInventoryKey !== inventoryRequestKey;
  const displayedInventory = loadedInventoryKey === inventoryRequestKey
    ? inventory
    : EMPTY_INVENTORY;

  useEffect(() => {
    let cancelled = false;
    loadProduct()
      .then((remoteProduct) => {
        if (cancelled) return;
        setProduct(remoteProduct);
        setError(null);
        setSelectedVariantId((current) => {
          if (current != null && remoteProduct.variants.some((variant) => variant.id === current)) {
            return current;
          }
          return remoteProduct.variants.find((variant) => variant.status === "ACTIVE")?.id
            ?? remoteProduct.variants[0]?.id
            ?? null;
        });
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(requestError, "Không thể tải sản phẩm"));
      })
      .finally(() => {
        if (!cancelled) setLoadedProductKey(reloadKey);
      });
    return () => { cancelled = true; };
  }, [loadProduct, reloadKey]);

  useEffect(() => {
    if (!inventoryEnabled || selectedVariantId == null) return;
    let cancelled = false;
    sellerProductService.getInventory(selectedVariantId, page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setInventory(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setInventory(EMPTY_INVENTORY);
          setError(getApiErrorMessage(requestError, "Không thể tải dữ liệu kho"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedInventoryKey(inventoryRequestKey);
      });
    return () => { cancelled = true; };
  }, [inventoryEnabled, inventoryRequestKey, page, selectedVariantId]);

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [product?.variants, selectedVariantId],
  );
  const parsedLines = useMemo(() => parseLines(inventoryText), [inventoryText]);
  const uniqueIdentifierCount = useMemo(
    () => new Set(parsedLines.map((line) => inventoryIdentifier(line, product?.productType))).size,
    [parsedLines, product?.productType],
  );

  function validateImport() {
    if (!parsedLines.length) return "Vui lòng nhập hoặc chọn file TXT có ít nhất một dòng.";
    if (parsedLines.length > MAX_IMPORT_LINES) {
      return `Mỗi lần chỉ được nạp tối đa ${MAX_IMPORT_LINES} dòng.`;
    }
    if (parsedLines.some((line) => line.length > MAX_LINE_LENGTH)) {
      return `Mỗi dòng chỉ được dài tối đa ${MAX_LINE_LENGTH.toLocaleString("vi-VN")} ký tự.`;
    }
    if (product?.productType === "ACCOUNT"
      && parsedLines.some((line) => !inventoryIdentifier(line, product.productType))) {
      return "Tài khoản phải có username đứng trước dấu |.";
    }
    return null;
  }

  async function readTxtFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
      modal.showError({ title: "File không hợp lệ", description: "Chỉ chấp nhận file định dạng .txt." });
      return;
    }
    if (file.size > MAX_TXT_BYTES) {
      modal.showError({ title: "File quá lớn", description: "File TXT không được vượt quá 2 MB." });
      return;
    }
    const text = await file.text();
    const lines = parseLines(text);
    if (lines.length > MAX_IMPORT_LINES) {
      modal.showError({
        title: "Quá nhiều tài khoản",
        description: `File có ${lines.length.toLocaleString("vi-VN")} dòng; mỗi lần chỉ nạp tối đa ${MAX_IMPORT_LINES} dòng.`,
      });
      return;
    }
    setInventoryText(lines.join("\n"));
  }

  async function handleImport() {
    if (selectedVariantId == null) return;
    const validationError = validateImport();
    if (validationError) {
      modal.showError({ title: "Chưa thể nạp kho", description: validationError });
      return;
    }
    setIsMutating(true);
    try {
      const result = await sellerProductService.uploadInventory(selectedVariantId, parsedLines);
      setInventoryText("");
      setPage(0);
      setReloadKey((current) => current + 1);
      modal.showSuccess({
        title: `Đã thêm ${result.addedCount.toLocaleString("vi-VN")} tài khoản`,
        description: result.duplicateCount > 0
          ? `${result.duplicateCount.toLocaleString("vi-VN")} dòng trùng đã được bỏ qua. Dữ liệu đã bán không thể nhập lại.`
          : "Kho và số lượng tồn đã được cập nhật.",
      });
    } catch (requestError: unknown) {
      modal.showError({ title: "Không thể nạp kho", description: getApiErrorMessage(requestError) });
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDeleteItem(asset: DigitalAsset) {
    const confirmed = await modal.confirm({
      title: "Xóa tài khoản khỏi kho?",
      description: "Chỉ bản ghi chưa bán này bị xóa. Sau khi xóa, bạn có thể nhập lại nếu cần.",
      confirmLabel: "Xóa tài khoản",
    });
    if (!confirmed) return;
    setIsMutating(true);
    try {
      await sellerProductService.deleteInventoryItem(asset.id);
      setReloadKey((current) => current + 1);
      modal.showSuccess({ title: "Đã xóa tài khoản khỏi kho" });
    } catch (requestError: unknown) {
      modal.showError({ title: "Không thể xóa tài khoản", description: getApiErrorMessage(requestError) });
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDeleteAll() {
    if (selectedVariantId == null || !selectedVariant) return;
    const confirmed = await modal.confirm({
      title: `Xóa toàn bộ kho “${selectedVariant.name}”?`,
      description: "Hệ thống chỉ xóa các tài khoản AVAILABLE chưa bán. Tài khoản đã giao hoặc đang trong giao dịch được giữ nguyên và không thể bán lại.",
      confirmLabel: "Xóa toàn bộ hàng chưa bán",
    });
    if (!confirmed) return;
    setIsMutating(true);
    try {
      const deletedCount = await sellerProductService.deleteAllAvailableInventory(selectedVariantId);
      setPage(0);
      setReloadKey((current) => current + 1);
      modal.showSuccess({ title: `Đã xóa ${deletedCount.toLocaleString("vi-VN")} tài khoản chưa bán` });
    } catch (requestError: unknown) {
      modal.showError({ title: "Không thể xóa kho", description: getApiErrorMessage(requestError) });
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDownload() {
    if (selectedVariantId == null || !product || !selectedVariant) return;
    setIsMutating(true);
    try {
      const blob = await sellerProductService.downloadInventory(selectedVariantId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeFilePart(product.name)}-${safeFilePart(selectedVariant.name)}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (requestError: unknown) {
      modal.showError({ title: "Không thể tải kho", description: getApiErrorMessage(requestError) });
    } finally {
      setIsMutating(false);
    }
  }

  if (!isLoadingProduct && product && product.deliveryType !== "INSTANT") {
    return (
      <div className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-6">
        <Link href="/seller/products" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-700"><ArrowLeft className="size-4" /> Quản lý sản phẩm</Link>
        <div className="mt-5 rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <PackagePlus className="mx-auto size-11 text-amber-500" />
          <h1 className="mt-3 text-xl font-black text-slate-950">Sản phẩm đặt hàng không dùng kho tự động</h1>
          <p className="mt-2 text-sm text-slate-500">Shop giao nội dung trong quá trình xử lý từng đơn; chức năng nạp credential chỉ áp dụng cho sản phẩm Giao ngay.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/seller/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-violet-700"><ArrowLeft className="size-4" /> Quản lý sản phẩm</Link>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý kho giao ngay</h1>
          <p className="mt-1 text-sm text-slate-500">{product?.name ?? "Đang tải sản phẩm..."}</p>
        </div>
        <button type="button" onClick={() => setReloadKey((current) => current + 1)} disabled={isLoadingProduct || isLoadingInventory || isMutating} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm hover:text-violet-700 disabled:opacity-50 sm:self-auto">
          <RefreshCw className={`size-4 ${isLoadingProduct || isLoadingInventory ? "animate-spin" : ""}`} /> Làm mới
        </button>
      </div>

      {error ? <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Chọn biến thể</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product?.variants.map((variant) => (
            <button key={variant.id} type="button" onClick={() => { setSelectedVariantId(variant.id); setPage(0); }} className={`rounded-xl border px-4 py-2.5 text-left transition ${selectedVariantId === variant.id ? "border-violet-500 bg-violet-50 text-violet-800 ring-2 ring-violet-100" : "border-slate-200 text-slate-600 hover:border-violet-200"}`}>
              <span className="block text-sm font-black">{variant.name}</span>
              <span className="mt-0.5 block text-xs">{variant.stockCount.toLocaleString("vi-VN")} còn hàng · {variant.status === "ACTIVE" ? "Đang bán" : "Tạm dừng"}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(320px,.82fr)_minmax(0,1.18fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><UploadCloud className="size-5" /></span>
            <div><h2 className="font-black text-slate-950">Thêm tài khoản vào kho</h2><p className="mt-1 text-xs leading-5 text-slate-500">Mỗi dòng là một tài khoản, key hoặc nội dung giao cho đúng một lượt mua.</p></div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); void readTxtFile(event.dataTransfer.files[0]); }}
            className={`mt-4 grid min-h-28 w-full place-items-center rounded-xl border-2 border-dashed px-4 text-center transition ${isDragging ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50 hover:border-violet-300"}`}
          >
            <span><FileText className="mx-auto size-7 text-violet-500" /><span className="mt-2 block text-sm font-black text-slate-700">Kéo file TXT vào đây hoặc nhấn để chọn</span><span className="mt-1 block text-xs text-slate-400">Tối đa 2 MB và {MAX_IMPORT_LINES} dòng mỗi lần</span></span>
          </button>
          <input ref={fileInputRef} type="file" accept=".txt,text/plain" className="sr-only" onClick={(event) => { event.currentTarget.value = ""; }} onChange={(event) => void readTxtFile(event.target.files?.[0])} />

          <label className="mt-4 block">
            <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600"><span>Nhập trực tiếp, mỗi tài khoản một dòng</span><span>{parsedLines.length}/{MAX_IMPORT_LINES}</span></span>
            <textarea value={inventoryText} onChange={(event) => setInventoryText(event.target.value)} placeholder={"email1@example.com|password1\nemail2@example.com|password2"} className="min-h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-mono text-xs leading-5 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100" />
          </label>
          {parsedLines.length > uniqueIdentifierCount ? <p className="mt-2 text-xs font-semibold text-amber-600">Có {(parsedLines.length - uniqueIdentifierCount).toLocaleString("vi-VN")} tài khoản/key trùng ngay trong nội dung nhập; backend sẽ tự bỏ qua.</p> : null}
          <button type="button" onClick={() => void handleImport()} disabled={isMutating || selectedVariantId == null || !parsedLines.length} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><PackagePlus className="size-5" /> {isMutating ? "Đang xử lý..." : "Nạp vào biến thể đã chọn"}</button>
          <div className="mt-4 flex gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-800"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p>Hệ thống so fingerprint SHA-256 trên toàn sàn. Với tài khoản, username trước dấu | là định danh nên dù đổi password cũng không thể bán lại; credential không được ghi vào log.</p></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-black text-slate-950">Tài khoản chưa bán</h2><p className="mt-1 text-xs text-slate-500">{selectedVariant ? `${selectedVariant.name} · ${selectedVariant.stockCount.toLocaleString("vi-VN")} còn hàng` : "Chưa chọn biến thể"}</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setShowCredentials((current) => !current)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-violet-200 hover:text-violet-700">{showCredentials ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{showCredentials ? "Ẩn nội dung" : "Hiện nội dung"}</button>
              <button type="button" onClick={() => void handleDownload()} disabled={isMutating || selectedVariantId == null} className="inline-flex h-9 items-center gap-2 rounded-lg border border-sky-200 px-3 text-xs font-bold text-sky-700 hover:bg-sky-50 disabled:opacity-50"><Download className="size-4" /> Tải TXT</button>
              <button type="button" onClick={() => void handleDeleteAll()} disabled={isMutating || selectedVariantId == null} className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="size-4" /> Xóa tất cả</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Nội dung giao</th><th className="px-4 py-3">Ngày thêm</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingInventory ? Array.from({ length: 5 }, (_, index) => <tr key={index} className="animate-pulse"><td colSpan={4} className="px-4 py-3"><div className="h-8 rounded-lg bg-slate-100" /></td></tr>) : displayedInventory.data.length ? displayedInventory.data.map((asset) => {
                  const content = asset.deliveryContent || asset.assetData;
                  return <tr key={asset.id} className="hover:bg-slate-50/70"><td className="px-4 py-3 text-xs font-bold text-slate-500">#{asset.id}</td><td className="max-w-[440px] px-4 py-3"><code className="block truncate rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700" title={showCredentials ? content : "Nội dung đang được ẩn"}>{showCredentials ? content : "••••••••••••••••"}</code></td><td className="px-4 py-3 text-xs text-slate-500">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(asset.createdAt))}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => void handleDeleteItem(asset)} disabled={isMutating} title="Xóa tài khoản chưa bán" aria-label={`Xóa tài khoản ${asset.id}`} className="inline-grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="size-4" /></button></td></tr>;
                }) : <tr><td colSpan={4} className="px-4 py-14 text-center"><FileText className="mx-auto size-9 text-slate-300" /><p className="mt-2 text-sm font-bold text-slate-700">Biến thể chưa có tài khoản AVAILABLE</p><p className="mt-1 text-xs text-slate-400">Dữ liệu đã bán không xuất hiện lại trong kho.</p></td></tr>}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Trang {page + 1} · tối đa {PAGE_SIZE} dòng</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={isLoadingInventory || !displayedInventory.hasPrevious} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 disabled:opacity-40"><ChevronLeft className="size-4" /> Trước</button>
              <button type="button" onClick={() => setPage((current) => current + 1)} disabled={isLoadingInventory || !displayedInventory.hasNext} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 disabled:opacity-40">Sau <ChevronRight className="size-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
