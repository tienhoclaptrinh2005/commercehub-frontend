import { ImageIcon } from "lucide-react";

interface ProductImageGalleryProps {
  productName: string;
  imageUrl: string | null;
}

export function ProductImageGallery({
  productName,
  imageUrl,
}: ProductImageGalleryProps) {
  return (
    <section aria-label="Hình ảnh sản phẩm">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={productName}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-slate-100 to-emerald-50 text-emerald-900/20">
            <span className="text-center">
              <ImageIcon className="mx-auto size-20" strokeWidth={1.2} />
              <span className="mt-3 block text-sm font-semibold text-slate-400">
                Sản phẩm chưa có hình ảnh
              </span>
            </span>
          </div>
        )}
      </div>

    </section>
  );
}
