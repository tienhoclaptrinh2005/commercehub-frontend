"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  ImageIcon,
  Info,
  Layers3,
  PackagePlus,
  Plus,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { useCategories } from "@/hooks/api/useCategories";
import { getApiErrorMessage } from "@/services/api";
import { sellerProductService } from "@/services/seller-product.service";
import type {
  CategorySummary,
  CompleteProductImageUpload,
  CreateSellerProductPayload,
  ProductDeliveryType,
  ProductSummary,
} from "@/types";

const MAX_VARIANTS = 5;
const MAX_ASSETS_PER_VARIANT = 500;
const MAX_ASSET_LENGTH = 10_000;
const MAX_PRICE = 500_000_000;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ProductType = "ACCOUNT" | "OTHER";

interface ProductDraft {
  name: string;
  categoryId: string;
  productType: ProductType;
  deliveryType: ProductDeliveryType;
  shortDescription: string;
  description: string;
}

interface VariantDraft {
  key: number;
  name: string;
  price: string;
  durationDays: string;
  inventoryText: string;
}

interface LeafCategory {
  id: number;
  label: string;
}

const INITIAL_PRODUCT: ProductDraft = {
  name: "",
  categoryId: "",
  productType: "ACCOUNT",
  deliveryType: "INSTANT",
  shortDescription: "",
  description: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function collectLeafCategories(
  categories: CategorySummary[],
  parents: string[] = [],
): LeafCategory[] {
  return categories.flatMap((category) => {
    const path = [...parents, category.name];
    if (category.children?.length) {
      return collectLeafCategories(category.children, path);
    }
    return category.parentId == null
      ? []
      : [{ id: category.id, label: path.join(" › ") }];
  });
}

function parseInventory(rawValue: string) {
  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeVariantName(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

function Counter({ current, max }: { current: number; max: number }) {
  return (
    <span className={`text-xs ${current > max ? "font-bold text-rose-600" : "text-slate-400"}`}>
      {current}/{max}
    </span>
  );
}

export function SellerProductCreateScreen() {
  const router = useRouter();
  const modal = useAppModal();
  const { categories, isLoading: categoriesLoading, error: categoriesError, refresh } = useCategories();
  const nextVariantKey = useRef(2);
  const completedInventoryVariantIds = useRef(new Set<number>());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [product, setProduct] = useState<ProductDraft>(INITIAL_PRODUCT);
  const [variants, setVariants] = useState<VariantDraft[]>([
    { key: 1, name: "Mặc định", price: "", durationDays: "", inventoryText: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<ProductSummary | null>(null);
  const [createdProductWasPaused, setCreatedProductWasPaused] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<CompleteProductImageUpload | null>(null);

  const leafCategories = useMemo(() => collectLeafCategories(categories), [categories]);
  const formLocked = isSubmitting || createdProduct != null;

  useEffect(() => () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  function patchProduct<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setProduct((current) => ({ ...current, [key]: value }));
  }

  function patchVariant<K extends keyof Omit<VariantDraft, "key">>(
    key: number,
    field: K,
    value: VariantDraft[K],
  ) {
    setVariants((current) => current.map((variant) => (
      variant.key === key ? { ...variant, [field]: value } : variant
    )));
  }

  function addVariant() {
    if (variants.length >= MAX_VARIANTS) {
      modal.showInfo({
        title: "Đã đạt giới hạn biến thể",
        description: `Mỗi sản phẩm chỉ được tạo tối đa ${MAX_VARIANTS} biến thể.`,
      });
      return;
    }
    const key = nextVariantKey.current++;
    setVariants((current) => [
      ...current,
      { key, name: `Biến thể ${current.length + 1}`, price: "", durationDays: "", inventoryText: "" },
    ]);
  }

  function removeVariant(key: number) {
    if (variants.length === 1) {
      modal.showInfo({
        title: "Cần ít nhất một biến thể",
        description: "Sản phẩm phải có tối thiểu một biến thể để thiết lập giá bán.",
      });
      return;
    }
    setVariants((current) => current.filter((variant) => variant.key !== key));
  }

  function validateBasicInformation() {
    if (!product.name.trim()) return "Vui lòng nhập tên sản phẩm.";
    if (product.name.trim().length > 255) return "Tên sản phẩm tối đa 255 ký tự.";
    if (!product.categoryId) return "Vui lòng chọn danh mục con cho sản phẩm.";
    if (!product.shortDescription.trim()) return "Vui lòng nhập mô tả ngắn.";
    if (product.shortDescription.trim().length > 200) return "Mô tả ngắn tối đa 200 ký tự.";
    if (!product.description.trim()) return "Vui lòng nhập mô tả chi tiết sản phẩm.";
    if (product.description.trim().length > 50_000) return "Mô tả chi tiết tối đa 50.000 ký tự.";
    if (imageFile && !ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
      return "Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP.";
    }
    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
      return "Ảnh đại diện không được vượt quá 2 MB.";
    }
    return null;
  }

  function handleImageSelection(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      modal.showError({
        title: "Định dạng ảnh không hợp lệ",
        description: "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.",
      });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      modal.showError({
        title: "Ảnh quá lớn",
        description: "Dung lượng ảnh tối đa là 2 MB.",
      });
      return;
    }

    setImageFile(file);
    setUploadedImage(null);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function removeSelectedImage() {
    setImageFile(null);
    setUploadedImage(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function validateVariants() {
    if (variants.length < 1 || variants.length > MAX_VARIANTS) {
      return `Sản phẩm phải có từ 1 đến ${MAX_VARIANTS} biến thể.`;
    }
    const names = new Set<string>();
    for (let index = 0; index < variants.length; index += 1) {
      const variant = variants[index];
      const displayIndex = index + 1;
      const normalizedName = normalizeVariantName(variant.name);
      if (!normalizedName) return `Vui lòng nhập tên biến thể #${displayIndex}.`;
      if (variant.name.trim().length > 100) return `Tên biến thể #${displayIndex} tối đa 100 ký tự.`;
      if (names.has(normalizedName)) return "Tên các biến thể không được trùng nhau.";
      names.add(normalizedName);

      const price = Number(variant.price);
      if (!Number.isInteger(price) || price <= 0 || price > MAX_PRICE) {
        return `Giá biến thể #${displayIndex} phải từ 1đ đến 500.000.000đ.`;
      }
      if (variant.durationDays) {
        const durationDays = Number(variant.durationDays);
        if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 36_500) {
          return `Thời hạn biến thể #${displayIndex} phải từ 1 đến 36.500 ngày.`;
        }
      }
      if (product.deliveryType === "INSTANT") {
        const assets = parseInventory(variant.inventoryText);
        if (assets.length > MAX_ASSETS_PER_VARIANT) {
          return `Kho của biến thể #${displayIndex} chỉ được nạp tối đa ${MAX_ASSETS_PER_VARIANT} dòng mỗi lần.`;
        }
        if (assets.some((asset) => asset.length > MAX_ASSET_LENGTH)) {
          return `Mỗi dòng dữ liệu kho của biến thể #${displayIndex} tối đa 10.000 ký tự.`;
        }
      }
    }
    return null;
  }

  function goToVariants() {
    const message = validateBasicInformation();
    if (message) {
      modal.showError({ title: "Thông tin chưa hợp lệ", description: message });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadInitialInventory(remoteProduct: ProductSummary) {
    if (product.deliveryType !== "INSTANT") return;

    for (const variant of variants) {
      const assets = parseInventory(variant.inventoryText);
      if (!assets.length) continue;
      const remoteVariant = remoteProduct.variants.find(
        (candidate) => normalizeVariantName(candidate.name) === normalizeVariantName(variant.name),
      );
      if (!remoteVariant) {
        throw new Error(`Không tìm thấy biến thể “${variant.name}” vừa tạo.`);
      }
      if (completedInventoryVariantIds.current.has(remoteVariant.id)) continue;
      await sellerProductService.uploadInventory(remoteVariant.id, assets);
      completedInventoryVariantIds.current.add(remoteVariant.id);
    }
  }

  async function finishSetup(remoteProduct: ProductSummary, reactivateAfterSetup: boolean) {
    await uploadInitialInventory(remoteProduct);
    if (reactivateAfterSetup) {
      await sellerProductService.updateStatus(remoteProduct.id, "ACTIVE");
    }
    modal.showSuccess({
      title: "Tạo sản phẩm thành công",
      description: product.deliveryType === "PRE_ORDER"
        ? "Sản phẩm đặt hàng đã được mở bán với thời gian xử lý tối đa 24 giờ sau khi Shop tiếp nhận."
        : "Sản phẩm giao ngay và dữ liệu kho ban đầu đã được lưu.",
    });
    router.push("/seller/products");
    router.refresh();
  }

  async function handleSubmit() {
    const basicError = validateBasicInformation();
    const variantError = validateVariants();
    const message = basicError ?? variantError;
    if (message) {
      modal.showError({ title: "Chưa thể tạo sản phẩm", description: message });
      return;
    }

    setIsSubmitting(true);
    let remoteProduct = createdProduct;
    try {
      if (!remoteProduct) {
        let thumbnailObjectKey = uploadedImage?.objectKey;
        if (imageFile && !thumbnailObjectKey) {
          const completedUpload = await sellerProductService.uploadProductImage(imageFile);
          setUploadedImage(completedUpload);
          thumbnailObjectKey = completedUpload.objectKey;
        }

        const payload: CreateSellerProductPayload = {
          categoryId: Number(product.categoryId),
          name: product.name.trim(),
          shortDescription: product.shortDescription.trim(),
          description: product.description.trim(),
          productType: product.productType,
          deliveryType: product.deliveryType,
          thumbnailUrl: thumbnailObjectKey,
          variants: variants.map((variant, index) => ({
            name: variant.name.trim(),
            price: Number(variant.price),
            durationDays: variant.durationDays ? Number(variant.durationDays) : undefined,
            sortOrder: index,
          })),
        };
        remoteProduct = await sellerProductService.createProduct(payload);
        setCreatedProduct(remoteProduct);
      }

      await finishSetup(remoteProduct, createdProductWasPaused);
    } catch (requestError: unknown) {
      if (remoteProduct) {
        try {
          await sellerProductService.updateStatus(remoteProduct.id, "INACTIVE");
          setCreatedProductWasPaused(true);
        } catch {
          // Giữ lỗi gốc để seller biết chính xác bước nào chưa hoàn tất.
        }
      }
      modal.showError({
        title: remoteProduct ? "Chưa hoàn tất dữ liệu sản phẩm" : "Không thể tạo sản phẩm",
        description: remoteProduct
          ? `${getApiErrorMessage(requestError)} Sản phẩm đã tạo được giữ ở trạng thái tạm dừng; bạn có thể thử hoàn tất lại mà không tạo trùng.`
          : getApiErrorMessage(requestError),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/seller/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-violet-700">
            <ArrowLeft className="size-4" /> Quản lý sản phẩm
          </Link>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Thêm sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo mặt hàng mới bằng dữ liệu thật của gian hàng.</p>
        </div>
        <ol className="flex items-center gap-2 text-xs font-bold" aria-label="Tiến trình tạo sản phẩm">
          <li className={`flex items-center gap-2 rounded-full px-3 py-2 ${step === 1 ? "bg-violet-600 text-white" : "bg-emerald-100 text-emerald-700"}`}>
            {step === 2 ? <Check className="size-4" /> : <span>1</span>} Thông tin
          </li>
          <ArrowRight className="size-4 text-slate-300" />
          <li className={`rounded-full px-3 py-2 ${step === 2 ? "bg-violet-600 text-white" : "bg-white text-slate-400"}`}>2 Biến thể &amp; giá</li>
        </ol>
      </div>

      {createdProduct ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <CircleAlert className="mt-0.5 size-5 shrink-0" />
          <p><strong>Sản phẩm #{createdProduct.id} đã được tạo.</strong> Các trường được khóa để tránh tạo trùng; hãy nhấn “Thử hoàn tất” để tiếp tục bước dữ liệu kho còn thiếu.</p>
        </div>
      ) : null}

      <fieldset disabled={formLocked} className="mt-6 disabled:opacity-80">
        {step === 1 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><PackagePlus className="size-5" /></span>
              <div>
                <h2 className="text-lg font-black text-slate-950">Thông tin sản phẩm cơ bản</h2>
                <p className="text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)]">
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Tên sản phẩm <b className="text-rose-500">*</b></span>
                  <input className={INPUT_CLASS} value={product.name} maxLength={255} onChange={(event) => patchProduct("name", event.target.value)} placeholder="Ví dụ: Tài khoản Canva Pro 1 tháng" />
                  <span className="mt-1.5 flex justify-end"><Counter current={product.name.length} max={255} /></span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Danh mục con <b className="text-rose-500">*</b></span>
                  <select className={INPUT_CLASS} value={product.categoryId} onChange={(event) => patchProduct("categoryId", event.target.value)} disabled={categoriesLoading || Boolean(categoriesError)}>
                    <option value="">{categoriesLoading ? "Đang tải danh mục..." : "Chọn danh mục"}</option>
                    {leafCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                  </select>
                  {categoriesError ? (
                    <button type="button" onClick={refresh} className="mt-2 text-xs font-bold text-rose-600 hover:underline">{categoriesError} — tải lại</button>
                  ) : <p className="mt-1.5 text-xs text-slate-400">Backend chỉ cho phép đăng bán trong danh mục con.</p>}
                </label>

                <div>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Loại dữ liệu sản phẩm</span>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                    {([[
                      "ACCOUNT", "Tài khoản số",
                    ], ["OTHER", "Sản phẩm khác"]] as const).map(([value, label]) => (
                      <button key={value} type="button" onClick={() => patchProduct("productType", value)} className={`h-10 rounded-lg text-sm font-bold transition ${product.productType === value ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Hình thức giao hàng <b className="text-rose-500">*</b></span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => patchProduct("deliveryType", "INSTANT")} className={`rounded-xl border p-4 text-left transition ${product.deliveryType === "INSTANT" ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="flex items-center gap-2 font-black text-slate-900"><Zap className="size-4 text-violet-600" /> Giao ngay</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">Hệ thống tự lấy một dòng dữ liệu từ kho để giao buyer.</span>
                    </button>
                    <button type="button" onClick={() => patchProduct("deliveryType", "PRE_ORDER")} className={`rounded-xl border p-4 text-left transition ${product.deliveryType === "PRE_ORDER" ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100" : "border-slate-200 hover:border-slate-300"}`}>
                      <span className="flex items-center gap-2 font-black text-slate-900"><Clock3 className="size-4 text-amber-600" /> Đặt hàng</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">Shop tiếp nhận rồi xử lý và giao kết quả cho buyer.</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-700">Ảnh đại diện</span>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-black text-white transition hover:bg-violet-700"
                  >
                    <Upload className="size-4" /> {imageFile ? "Đổi ảnh" : "Chọn ảnh"}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => handleImageSelection(event.target.files?.[0])}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">JPG, PNG hoặc WebP; tối đa 2 MB. Ảnh được tải lên khi bạn tạo sản phẩm.</p>
                <div className="relative mt-3 grid aspect-[16/10] place-items-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  {imagePreviewUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreviewUrl} alt="Xem trước ảnh sản phẩm" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-950/70 text-white transition hover:bg-rose-600"
                        aria-label="Bỏ ảnh đã chọn"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center"><ImageIcon className="mx-auto size-9" /><p className="mt-2 text-xs font-bold">Chưa có ảnh</p></div>
                  )}
                </div>
                {imageFile ? (
                  <p className="mt-2 truncate text-xs font-semibold text-slate-500">
                    {imageFile.name} · {(imageFile.size / 1024).toFixed(0)} KB
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Mô tả ngắn <b className="text-rose-500">*</b></span>
                <textarea className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" value={product.shortDescription} maxLength={200} onChange={(event) => patchProduct("shortDescription", event.target.value)} placeholder="Tóm tắt ngắn gọn nội dung và điểm nổi bật..." />
                <span className="mt-1.5 flex justify-end"><Counter current={product.shortDescription.length} max={200} /></span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Mô tả chi tiết <b className="text-rose-500">*</b></span>
                <textarea className="min-h-48 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" value={product.description} maxLength={50_000} onChange={(event) => patchProduct("description", event.target.value)} placeholder="Mô tả cách sử dụng, điều kiện giao hàng và chính sách bảo hành của sản phẩm..." />
                <span className="mt-1.5 flex justify-end"><Counter current={product.description.length} max={50_000} /></span>
              </label>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><Layers3 className="size-5" /></span>
                <div><h2 className="text-lg font-black text-slate-950">Biến thể &amp; giá bán</h2><p className="text-xs text-slate-500">Tối đa 5 biến thể cho mỗi sản phẩm.</p></div>
              </div>
              <button type="button" onClick={addVariant} disabled={variants.length >= MAX_VARIANTS || formLocked} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black uppercase text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Plus className="size-4" /> Thêm biến thể ({variants.length}/{MAX_VARIANTS})
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {variants.map((variant, index) => {
                const stockCount = parseInventory(variant.inventoryText).length;
                return (
                  <article key={variant.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-black text-violet-700">Biến thể #{index + 1}</span>
                      {variants.length > 1 ? <button type="button" onClick={() => removeVariant(variant.key)} className="inline-grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Xóa biến thể ${index + 1}`}><Trash2 className="size-4" /></button> : null}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(180px,.75fr)_minmax(150px,.6fr)]">
                      <label><span className="mb-2 block text-xs font-bold text-slate-600">Tên biến thể <b className="text-rose-500">*</b></span><input className={INPUT_CLASS} value={variant.name} maxLength={100} onChange={(event) => patchVariant(variant.key, "name", event.target.value)} placeholder="Ví dụ: Gói 1 tháng" /></label>
                      <label><span className="mb-2 block text-xs font-bold text-slate-600">Giá bán (đ) <b className="text-rose-500">*</b></span><input className={INPUT_CLASS} inputMode="numeric" value={variant.price} onChange={(event) => patchVariant(variant.key, "price", event.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="0" /></label>
                      <label><span className="mb-2 block text-xs font-bold text-slate-600">Thời hạn (ngày)</span><input className={INPUT_CLASS} inputMode="numeric" value={variant.durationDays} onChange={(event) => patchVariant(variant.key, "durationDays", event.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="Không bắt buộc" /></label>
                    </div>

                    {product.deliveryType === "INSTANT" ? (
                      <div className="mt-4 rounded-xl border border-sky-100 bg-white p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div><p className="text-sm font-black text-slate-800">Dữ liệu kho giao ngay</p><p className="mt-0.5 text-xs text-slate-500">Mỗi dòng là một tài khoản, key hoặc nội dung giao cho một lượt mua.</p></div>
                          <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${stockCount ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>Tồn kho: {stockCount}</span>
                        </div>
                        <textarea value={variant.inventoryText} onChange={(event) => patchVariant(variant.key, "inventoryText", event.target.value)} className="mt-3 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-mono text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100" placeholder={"username|password\nusername2|password2"} />
                        <p className="mt-2 text-xs text-slate-400">Có thể để trống và nạp kho sau. Mỗi lần tối đa 500 dòng, mỗi dòng tối đa 10.000 ký tự.</p>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex gap-3"><Info className="mt-0.5 size-5 shrink-0 text-amber-600" /><div><p className="text-sm font-black text-amber-900">Sản phẩm đặt hàng</p><p className="mt-1 text-xs leading-5 text-amber-800">Không dùng kho tự động. Sau khi Shop tiếp nhận đơn, Shop có tối đa 24 giờ để xử lý và giao kết quả cho buyer.</p></div></div>
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700"><span className="grid size-5 place-items-center rounded bg-violet-500 text-white"><Check className="size-3.5" /></span> Không giới hạn tồn kho</div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </fieldset>

      <div className="mt-5 flex items-center justify-between gap-3">
        {step === 2 ? (
          <button type="button" disabled={formLocked} onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"><ArrowLeft className="size-4" /> Quay lại</button>
        ) : <span />}
        {step === 1 ? (
          <button type="button" onClick={goToVariants} disabled={formLocked || categoriesLoading} className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">Tiếp theo <ArrowRight className="size-4" /></button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? "Đang lưu..." : createdProduct ? "Thử hoàn tất" : "Tạo sản phẩm"} <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
