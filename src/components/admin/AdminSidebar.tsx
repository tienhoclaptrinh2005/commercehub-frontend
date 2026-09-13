"use client";

import {
  BadgeDollarSign, Boxes, ChartNoAxesCombined, CircleDollarSign, ClipboardList,
  History, LayoutDashboard, Landmark, ListTree, Scale, ShieldCheck, Store, Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "Tổng quan", LayoutDashboard],
  ["/admin/shops", "Duyệt gian hàng", Store],
  ["/admin/products", "Kiểm duyệt sản phẩm", Boxes],
  ["/admin/users", "Người dùng", Users],
  ["/admin/categories", "Danh mục", ListTree],
  ["/admin/disputes", "Khiếu nại", Scale],
  ["/admin/withdrawals", "Yêu cầu rút tiền", Landmark],
  ["/admin/deposits", "Nạp tiền", CircleDollarSign],
  ["/admin/transactions", "Dòng tiền toàn sàn", History],
  ["/admin/fees", "Phí sàn", BadgeDollarSign],
  ["/admin/audit-logs", "Nhật ký quản trị", ClipboardList],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="border-b border-slate-200 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:border-slate-800">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-violet-600"><ShieldCheck className="size-5" /></span>
        <div><p className="font-black">CommerceHub</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin console</p></div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible">
        {links.map(([href,label,Icon]) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active?"bg-violet-600 text-white shadow-lg shadow-violet-950/30":"text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
            <Icon className="size-4" />{label}
          </Link>;
        })}
      </nav>
      <div className="hidden px-4 lg:absolute lg:bottom-5 lg:block lg:w-full">
        <Link href="/" className="flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-white"><ChartNoAxesCombined className="size-4" />Về trang bán hàng</Link>
      </div>
    </aside>
  );
}
