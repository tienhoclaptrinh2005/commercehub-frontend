"use client";

import {
  Box,
  Eye,
  ImageIcon,
  PackageCheck,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GroupedPagination } from "@/components/common/GroupedPagination";
import { useAppModal } from "@/components/ui/app-modal";
import { useCategories } from "@/hooks/api/useCategories";
import { useSellerProducts } from "@/hooks/api/useSellerProducts";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { sellerProductService } from "@/services/seller-product.service";
import type { ProductDeliveryType, ProductStatus, SellerProductFilters } from "@/types";

const PAGE_SIZE = 10;

function deliveryLabel(deliveryType: ProductDeliveryType) {
  return deliveryType === "PRE_ORDER" ? "Đặt hàng" : "Giao ngay";
}

function productTypeLabel(productType: string) {
  if (productType === "ACCOUNT") return "Tài khoản";
  if (productType === "OTHER") return "Sản phẩm";
  return productType.replaceAll("_", " ");
}

export function SellerProductsScreen() {
  const modal = useAppModal();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [page, setPage] = useState(0);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const filters = useMemo<SellerProductFilters>(
    () => ({
      keyword: debouncedKeyword || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      deliveryType: (deliveryType || undefined) as ProductDeliveryType | undefined,
      page,
      size: PAGE_SIZE,
    }),
    [categoryId, debouncedKeyword, deliveryType, page],
  );
  const { result, error, isLoading, refresh } = useSellerProducts(filters);

  const categoryOptions = useMemo(
    () => categories.flatMap((parent) => [
      { id: parent.id, name: parent.name, isParent: true },
      ...(parent.children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        isParent: false,
      })),
    ]),
    [categories],
  );

  async function toggleStatus(productId: number, currentStatus: ProductStatus, name: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmed = await modal.confirm({
      title: nextStatus === "ACTIVE" ? "Mở bán sản phẩm?" : "Tạm dừng sản phẩm?",
      description: nextStatus === "ACTIVE"
        ? `Sản phẩm “${name}” sẽ xuất hiện lại với người mua.`
        : `Sản phẩm “${name}” sẽ được ẩn khỏi khu vực mua hàng.`,
      confirmLabel: nextStatus === "ACTIVE" ? "Mở bán" : "Tạm dừng",
    });
    if (!confirmed) return;

    setUpdatingProductId(productId);
    try {
      await sellerProductService.updateStatus(productId, nextStatus);
      modal.showSuccess({
        title: nextStatus === "ACTIVE" ? "Đã mở bán sản phẩm" : "Đã tạm dừng sản phẩm",
      });
      refresh();
    } catch (requestError: unknown) {
      modal.showError({
        title: "Không thể cập nhật sản phẩm",
        description: getApiErrorMessage(requestError),
      });
    } finally {
      setUpdatingProductId(null);
    }
  }

  const firstItem = result.totalElements === 0 ? 0 : result.currentPage * result.pageSize + 1;
  const lastItem = Math.min(
    result.totalElements,
    result.currentPage * result.pageSize + result.data.length,
  );
  const accessibleTotalPages = Math.min(result.totalPages, 101);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Seller Center</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">Kiểm soát kho hàng và các mặt hàng của chính gian hàng bạn.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <Link
            href="/seller/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="size-5" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      <section className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(280px,1fr)_260px_220px]">
        <label className="relative block">
          <span className="sr-only">Tìm kiếm sản phẩm</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value.slice(0, 100))}
            placeholder="Tìm theo tên hoặc mô tả sản phẩm..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </label>

        <label>
          <span className="sr-only">Lọc theo danh mục</span>
          <select
            value={categoryId}
            onChange={(event) => { setCategoryId(event.target.value); setPage(0); }}
            disabled={categoriesLoading}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:opacity-50"
          >
            <option value="">Tất cả danh mục</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.isParent ? category.name : `— ${category.name}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Lọc theo hình thức giao hàng</span>
          <select
            value={deliveryType}
            onChange={(event) => { setDeliveryType(event.target.value); setPage(0); }}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="">Tất cả loại hình</option>
            <option value="INSTANT">Giao ngay</option>
            <option value="PRE_ORDER">Đặt hàng</option>
          </select>
        </label>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="grid min-h-64 place-items-center px-5 py-10 text-center">
            <div>
              <PackageCheck className="mx-auto size-10 text-rose-400" />
              <p className="mt-3 font-bold text-slate-900">Không thể tải danh sách sản phẩm</p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button type="button" onClick={refresh} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">Thử lại</button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Sản phẩm</th>
                  <th className="px-4 py-4 font-bold">Giá bán</th>
                  <th className="px-4 py-4 text-center font-bold">Kho hàng</th>
                  <th className="px-4 py-4 text-center font-bold">Đã bán</th>
                  <th className="px-4 py-4 font-bold">Trạng thái</th>
                  <th className="px-5 py-4 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? Array.from({ length: 4 }, (_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-5"><div className="h-12 rounded-lg bg-slate-100" /></td>
                    {Array.from({ length: 5 }, (_, cell) => <td key={cell} className="px-4 py-5"><div className="h-5 rounded bg-slate-100" /></td>)}
                  </tr>
                )) : result.data.length ? result.data.map((product) => {
                  const active = product.status === "ACTIVE";
                  const updating = updatingProductId === product.id;
                  return (
                    <tr key={product.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                            {product.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.thumbnailUrl} alt={product.name} className="size-full object-cover" />
                            ) : <ImageIcon className="size-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/products/${product.slug}`} className="max-w-[360px] truncate text-sm font-bold text-slate-950 hover:text-violet-700">
                                {product.name}
                              </Link>
                              <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black uppercase ${product.deliveryType === "PRE_ORDER" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                                {deliveryLabel(product.deliveryType)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-slate-500">{product.categoryName} · {productTypeLabel(product.productType)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-emerald-700">{formatCurrency(product.minPrice)}</td>
                      <td className="px-4 py-4 text-center">
                        {product.deliveryType === "PRE_ORDER" ? (
                          <span className="text-xs font-semibold text-slate-500">Theo đơn</span>
                        ) : (
                          <span className={`inline-grid min-w-9 place-items-center rounded-lg px-2 py-1.5 text-sm font-black ${product.stockCount > 0 ? "bg-slate-900 text-white" : "bg-rose-50 text-rose-600"}`}>{product.stockCount}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-slate-700">{new Intl.NumberFormat("vi-VN").format(product.soldCount)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={active}
                            aria-label={`${active ? "Tạm dừng" : "Mở bán"} ${product.name}`}
                            disabled={updating}
                            onClick={() => toggleStatus(product.id, product.status, product.name)}
                            className={`relative h-6 w-11 rounded-full transition ${active ? "bg-emerald-600" : "bg-slate-300"} disabled:opacity-50`}
                          >
                            <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${active ? "left-6" : "left-1"}`} />
                          </button>
                          <span className={`text-xs font-bold ${active ? "text-emerald-700" : "text-slate-500"}`}>{active ? "Đang bán" : "Tạm dừng"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link href={`/products/${product.slug}`} title="Xem sản phẩm" aria-label={`Xem ${product.name}`} className="inline-grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700">
                            <Eye className="size-4" />
                          </Link>
                          {product.deliveryType === "INSTANT" ? (
                            <Link href={`/seller/products/${product.id}/inventory`} title="Thêm và quản lý kho" aria-label={`Quản lý kho ${product.name}`} className="inline-grid size-9 place-items-center rounded-lg border border-sky-200 text-sky-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">
                              <PackagePlus className="size-4" />
                            </Link>
                          ) : null}
                          <Link href={`/seller/products/${product.id}/edit`} title="Chỉnh sửa sản phẩm" aria-label={`Chỉnh sửa ${product.name}`} className="inline-grid size-9 place-items-center rounded-lg border border-amber-200 text-amber-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">
                            <Pencil className="size-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Box className="mx-auto size-11 text-slate-300" />
                      <p className="mt-3 font-bold text-slate-800">Không tìm thấy sản phẩm</p>
                      <p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc đang chọn.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!error && !isLoading ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <ShoppingBag className="size-4 text-violet-500" />
              Hiển thị {firstItem}–{lastItem} / {new Intl.NumberFormat("vi-VN").format(result.totalElements)} sản phẩm
            </p>
            <GroupedPagination currentPage={result.currentPage} totalPages={accessibleTotalPages} onPageChange={setPage} isLoading={isLoading} groupSize={3} ariaLabel="Phân trang sản phẩm của gian hàng" className="mt-0" />
          </div>
        ) : null}
      </section>
    </div>
  );
}
