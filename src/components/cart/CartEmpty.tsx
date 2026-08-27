import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function CartEmpty() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <ShoppingBag className="size-8" />
      </span>
      <h2 className="mt-5 text-xl font-black text-slate-950">Giỏ hàng đang trống</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Chọn sản phẩm và phân loại phù hợp, sau đó thêm vào giỏ để thanh toán cùng lúc.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        Tiếp tục mua sắm
      </Link>
    </section>
  );
}
