import type { LucideIcon } from "lucide-react";
import {
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag,
  WalletCards,
} from "lucide-react";

import { SellerRevenueChart } from "./SellerRevenueChart";

const overviewCards: Array<{
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    label: "Đơn tháng này",
    value: "18",
    note: "+4 so với tháng trước",
    icon: ShoppingBag,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    label: "Doanh thu tháng",
    value: "6.250.000đ",
    note: "+12,5% trong 30 ngày",
    icon: CircleDollarSign,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Số dư khả dụng",
    value: "4.720.000đ",
    note: "Có thể rút ngay",
    icon: WalletCards,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    label: "Sản phẩm đang bán",
    value: "12",
    note: "10 sản phẩm còn hàng",
    icon: PackageCheck,
    tone: "bg-amber-50 text-amber-600",
  },
];

const recentOrders = [
  { code: "#CH-240812", product: "Netflix Premium 30 ngày", total: "159.000đ", status: "Hoàn thành" },
  { code: "#CH-240811", product: "Canva Pro 12 tháng", total: "299.000đ", status: "Đang giữ tiền" },
  { code: "#CH-240810", product: "ChatGPT Plus", total: "450.000đ", status: "Chờ xử lý" },
];

const orderStates = [
  { label: "Chờ xử lý", value: 3, icon: Clock3, color: "text-amber-600 bg-amber-50" },
  { label: "Đang giữ tiền", value: 5, icon: WalletCards, color: "text-sky-600 bg-sky-50" },
  { label: "Hoàn thành", value: 10, icon: PackageCheck, color: "text-emerald-600 bg-emerald-50" },
];

export function SellerDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Tổng quan</p>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              Dữ liệu minh họa
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Hoạt động bán hàng
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Theo dõi nhanh doanh thu, đơn hàng và tình trạng gian hàng của bạn.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số bán hàng">
        {overviewCards.map(({ label, value, note, icon: Icon, tone }) => (
          <article key={label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 truncate text-2xl font-extrabold tracking-[-0.035em] text-slate-950">{value}</p>
              </div>
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <SellerRevenueChart />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950">Đơn hàng gần đây</h2>
              <p className="mt-1 text-xs text-slate-500">Dữ liệu minh họa, chưa gọi API đơn hàng</p>
            </div>
            <ShoppingBag className="size-5 text-violet-600" />
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.code} className="grid gap-2 px-5 py-4 sm:grid-cols-[110px_minmax(0,1fr)_100px_120px] sm:items-center sm:px-6">
                <span className="text-xs font-bold text-violet-700">{order.code}</span>
                <span className="truncate text-sm font-semibold text-slate-700">{order.product}</span>
                <span className="text-sm font-bold text-slate-900">{order.total}</span>
                <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{order.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-950">Trạng thái đơn hàng</h2>
          <div className="mt-5 space-y-3">
            {orderStates.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className={`grid size-9 place-items-center rounded-xl ${color}`}>
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-600">{label}</span>
                <span className="text-lg font-extrabold text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
