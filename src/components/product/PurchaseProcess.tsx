import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Download,
  MessageSquareText,
  Search,
  WalletCards,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const commonSteps = [
  {
    number: "01",
    title: "Chọn đúng loại sản phẩm",
    description: "Kiểm tra nhãn Giao ngay hoặc Đặt trước, biến thể, giá bán và thông tin của shop.",
    icon: Search,
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    number: "02",
    title: "Thanh toán bằng ví",
    description: "Xác nhận đơn và thanh toán bằng số dư ví. Hệ thống giữ tiền để bảo vệ giao dịch.",
    icon: WalletCards,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
] as const;

export function PurchaseProcess() {
  return (
    <section className="mt-10" aria-labelledby="purchase-process-title">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Mua sắm an toàn</p>
            <h2 id="purchase-process-title" className="mt-1 text-2xl font-bold tracking-[-0.025em] text-slate-950">
              Quy trình mua hàng trên CommerceHub
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chọn sản phẩm và thanh toán theo hai hình thức giao hàng riêng biệt.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 sm:self-auto"
          >
            Bắt đầu mua sắm
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ol className="mt-7 grid gap-4 sm:grid-cols-2">
          {commonSteps.map((step) => {
            const Icon = step.icon;

            return (
              <li key={step.number} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl ring-1 ${step.tone}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-black tracking-[0.08em] text-slate-300">{step.number}</span>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
              </li>
            );
          })}
        </ol>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            Chọn một hình thức
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Zap className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-700">Sản phẩm có sẵn</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">Giao ngay</h3>
              </div>
            </div>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li className="flex gap-3"><StepMarker>1</StepMarker><span>Nhấn <strong className="text-slate-900">Mua ngay</strong> hoặc thêm sản phẩm vào giỏ hàng.</span></li>
              <li className="flex gap-3"><StepMarker>2</StepMarker><span>Hệ thống trừ ví, trừ kho và giao nội dung số tự động sau khi thanh toán.</span></li>
              <li className="flex gap-3"><Download className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" /><span>Xem nội dung đã mua hoặc tải tệp TXT trong chi tiết đơn hàng.</span></li>
            </ol>
          </article>

          <article className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Clock3 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-amber-700">Dịch vụ cần xử lý</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">Đặt hàng</h3>
              </div>
            </div>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li className="flex gap-3"><StepMarker>1</StepMarker><span>Nhấn <strong className="text-slate-900">Đặt hàng</strong> và gửi tối đa 100 ký tự thông tin cần thiết cho shop.</span></li>
              <li className="flex gap-3"><StepMarker>2</StepMarker><span>Shop có tối đa 48 giờ để nhận đơn; sau khi nhận, shop có 24 giờ để hoàn thành.</span></li>
              <li className="flex gap-3"><MessageSquareText className="mt-1 size-4 shrink-0 text-amber-700" aria-hidden="true" /><span>Nếu shop từ chối hoặc quá hạn, hệ thống hoàn tiền; kết quả bàn giao được lưu trong chi tiết đơn.</span></li>
            </ol>
          </article>
        </div>

        <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <p className="leading-6">
            <strong>Bảo vệ người mua:</strong> trong thời gian giữ tiền T+7, bạn có thể theo dõi đơn và gửi khiếu nại từ trang chi tiết đơn hàng khi sản phẩm phát sinh lỗi.
          </p>
        </div>
      </div>
    </section>
  );
}

function StepMarker({ children }: { children: ReactNode }) {
  return (
    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white text-[10px] font-black text-slate-700 ring-1 ring-slate-200">
      {children}
    </span>
  );
}
