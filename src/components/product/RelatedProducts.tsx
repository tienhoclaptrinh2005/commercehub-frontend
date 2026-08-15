"use client";

import { useProducts } from "@/hooks/api/useProducts";

import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

export function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  const { products, isLoading, error } = useProducts({
    categoryId,
    page: 0,
    size: 5,
  });
  const relatedProducts = products
    .filter((product) => product.id !== currentProductId)
    .slice(0, 4);

  if (!isLoading && (error || relatedProducts.length === 0)) {
    return null;
  }

  return (
    <section className="mt-14" aria-labelledby="related-products-title">
      <div className="flex items-center gap-3">
        <span className="h-8 w-1.5 rounded-full bg-emerald-600" />
        <h2
          id="related-products-title"
          className="text-2xl font-black tracking-[-0.03em] text-slate-950"
        >
          Sản phẩm liên quan
        </h2>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-[472px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="h-48 bg-slate-200" />
              <div className="space-y-4 p-4">
                <div className="h-5 w-4/5 rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-14 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="catalog" />
          ))}
        </div>
      )}
    </section>
  );
}
