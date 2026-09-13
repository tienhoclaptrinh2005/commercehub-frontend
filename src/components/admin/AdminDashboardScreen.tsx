"use client";

import { BadgeDollarSign, Banknote, Boxes, CircleAlert, Landmark, Scale, Store, TrendingUp, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { adminService } from "@/services/admin.service";
import { getApiErrorMessage } from "@/services/api";
import type { AdminDashboard } from "@/types";
import { AdminError, AdminLoading, AdminPageHeader } from "./AdminUi";

export function AdminDashboardScreen(){
  const [reload,setReload]=useState(0);
  const [state,setState]=useState<{key:number;data:AdminDashboard|null;error:string|null}>({key:-1,data:null,error:null});
  useEffect(()=>{let cancel=false;adminService.dashboard().then(data=>{if(!cancel)setState({key:reload,data,error:null})}).catch(error=>{if(!cancel)setState({key:reload,data:null,error:getApiErrorMessage(error)})});return()=>{cancel=true}},[reload]);
  if(state.key!==reload)return <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><AdminLoading/></main>;
  if(state.error||!state.data)return <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><AdminError message={state.error||"Không có dữ liệu"} onRetry={()=>setReload(v=>v+1)}/></main>;
  const d=state.data;
  return <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
    <AdminPageHeader eyebrow="Điều hành sàn" title="Tổng quan quản trị" description="Số liệu trực tiếp từ đơn hàng, ví, phí và hoạt động kiểm duyệt." action={<button onClick={()=>setReload(v=>v+1)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">Làm mới</button>}/>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Metric label="Tổng người dùng" value={d.totalUsers.toLocaleString("vi-VN")} note={`${d.activeSellers} seller hoạt động`} icon={Users}/>
      <Metric label="Shop chờ duyệt" value={d.pendingShops.toLocaleString("vi-VN")} note={`${d.activeShops} shop đang hoạt động`} icon={Store} href="/admin/shops?status=PENDING" alert={d.pendingShops>0}/>
      <Metric label="Sản phẩm đang bán" value={d.activeProducts.toLocaleString("vi-VN")} note="Kiểm duyệt sau đăng" icon={Boxes}/>
      <Metric label="Đơn trong tháng" value={d.ordersThisMonth.toLocaleString("vi-VN")} note="Không tính đơn đã hoàn tiền" icon={Banknote}/>
      <Metric label="GMV trong tháng" value={formatCurrency(d.gmvThisMonth)} note="Tự giảm khi đơn hoàn tiền" icon={TrendingUp}/>
      <Metric label="Phí sàn đã thu" value={formatCurrency(d.totalCollectedFees)} note={`Tháng này ${formatCurrency(d.collectedFeesThisMonth)}`} icon={BadgeDollarSign}/>
      <Metric label="Khiếu nại mở" value={d.openDisputes.toLocaleString("vi-VN")} note={`Tỷ lệ toàn sàn ${d.disputeRate.toLocaleString("vi-VN",{maximumFractionDigits:2})}%`} icon={Scale} href="/admin/disputes" alert={d.openDisputes>0}/>
      <Metric label="Chờ duyệt rút" value={d.pendingWithdrawals.toLocaleString("vi-VN")} note="Tiền đã được giữ khi tạo yêu cầu" icon={Landmark} href="/admin/withdrawals?status=PENDING" alert={d.pendingWithdrawals>0}/>
      <Metric label="Nạp cần đối soát" value={d.depositsNeedReview.toLocaleString("vi-VN")} note="REVIEW_REQUIRED" icon={CircleAlert} href="/admin/deposits?status=REVIEW_REQUIRED" alert={d.depositsNeedReview>0}/>
      <Metric label="Tổng số dư tạm giữ" value={formatCurrency(d.totalHoldBalance)} note="Tổng hold balance toàn hệ thống" icon={WalletCards}/>
    </section>
    <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <RevenueChart data={d.dailyMetrics}/>
      <div className="grid gap-5"><Leaderboard title="Top gian hàng tháng này" data={d.topShops}/><Leaderboard title="Top danh mục tháng này" data={d.topCategories}/></div>
    </section>
  </main>;
}

function Metric({label,value,note,icon:Icon,href,alert}:{label:string;value:string;note:string;icon:typeof Users;href?:string;alert?:boolean}){
  const body=<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${alert?"bg-rose-50 text-rose-600":"bg-violet-50 text-violet-700"}`}><Icon className="size-5"/></span></div><p className="mt-3 text-xs text-slate-500">{note}</p></div>;
  return href?<Link href={href}>{body}</Link>:body;
}
function RevenueChart({data}:{data:AdminDashboard["dailyMetrics"]}){const max=useMemo(()=>Math.max(1,...data.map(i=>i.gmv)),[data]);return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="font-black text-slate-950">GMV theo ngày</h2><p className="text-xs text-slate-500">Đơn đã thanh toán, tự cập nhật khi hoàn tiền.</p></div><div className="mt-6 flex h-64 items-end gap-1 overflow-x-auto border-b border-slate-200 pb-1">{data.map(item=><div key={item.date} title={`${item.date}: ${formatCurrency(item.gmv)}`} className="flex h-full min-w-3 flex-1 items-end"><div className="w-full rounded-t bg-violet-500 transition hover:bg-violet-700" style={{height:`${Math.max(item.gmv>0?3:0,(item.gmv/max)*100)}%`}}/></div>)}</div><div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400"><span>Ngày 1</span><span>Ngày {data.length}</span></div></section>}
function Leaderboard({title,data}:{title:string;data:AdminDashboard["topShops"]}){return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-950">{title}</h2><div className="mt-4 space-y-3">{data.length?data.map((item,index)=><div key={item.id} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">{index+1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{item.name}</p><p className="text-xs text-slate-400">{item.orderCount} đơn</p></div><b className="text-xs text-emerald-700">{formatCurrency(item.amount)}</b></div>):<p className="py-5 text-center text-sm text-slate-400">Chưa có giao dịch trong tháng.</p>}</div></section>}
