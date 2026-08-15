import { formatCurrency } from "@/lib/format";
import type { ProductVariant } from "@/types";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: number;
  onSelect: (variantId: number) => void;
}

export function ProductVariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        Sản phẩm chưa có phân loại đang hoạt động.
      </p>
    );
  }

  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Phân loại sản phẩm">
      {variants.map((variant) => {
        const isSelected = selectedVariantId === variant.id;

        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(variant.id)}
            className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
              isSelected
                ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            <span className="min-w-0 font-semibold">{variant.name}</span>
            <span
              className={`shrink-0 text-sm font-bold ${
                isSelected ? "text-white" : "text-emerald-700"
              }`}
            >
              {formatCurrency(Number(variant.price))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
