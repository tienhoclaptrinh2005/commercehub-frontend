import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function BrandLogo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
      aria-label="CommerceHub - Trang chủ"
    >
      <span
        className={`grid size-10 place-items-center rounded-xl ${
          light
            ? "bg-white text-emerald-700 shadow-lg shadow-emerald-950/20"
            : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
        }`}
      >
        <ShoppingBag className="size-5" strokeWidth={2.2} />
      </span>
      <span
        className={`text-xl font-bold tracking-[-0.03em] ${
          light ? "text-white" : "text-slate-950"
        }`}
      >
        Commerce<span className={light ? "text-emerald-200" : "text-emerald-600"}>Hub</span>
      </span>
    </Link>
  );
}
