"use client";

import { CircleAlert, LoaderCircle, RefreshCw, Search } from "lucide-react";
import type { ReactNode } from "react";

export function AdminPageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">{eyebrow}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</header>;
}

export function AdminToolbar({keyword,onKeywordChange,status,onStatusChange,statuses,loading,onReload,children}:{keyword:string;onKeywordChange:(v:string)=>void;status?:string;onStatusChange?:(v:string)=>void;statuses?:readonly {value:string;label:string}[];loading:boolean;onReload:()=>void;children?:ReactNode}) {
  return <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
    <label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400"/><input value={keyword} onChange={e=>onKeywordChange(e.target.value)} placeholder="Tìm kiếm..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"/></label>
    {statuses&&onStatusChange?<select value={status||""} onChange={e=>onStatusChange(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400"><option value="">Tất cả trạng thái</option>{statuses.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>:null}
    {children}<button type="button" onClick={onReload} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"><RefreshCw className={`size-4 ${loading?"animate-spin":""}`}/>Làm mới</button>
  </div>;
}

const STATUS_STYLE:Record<string,string>={ACTIVE:"bg-emerald-50 text-emerald-700",SUCCESS:"bg-emerald-50 text-emerald-700",DONE:"bg-emerald-50 text-emerald-700",COLLECTED:"bg-emerald-50 text-emerald-700",RESOLVED:"bg-emerald-50 text-emerald-700",PENDING:"bg-amber-50 text-amber-700",OPEN:"bg-amber-50 text-amber-700",REVIEW_REQUIRED:"bg-orange-50 text-orange-700",SUSPENDED:"bg-orange-50 text-orange-700",BANNED:"bg-rose-50 text-rose-700",REJECTED:"bg-rose-50 text-rose-700",FAILED:"bg-rose-50 text-rose-700",INACTIVE:"bg-slate-100 text-slate-600",EXPIRED:"bg-slate-100 text-slate-600"};
export function AdminStatus({value}:{value:string}) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${STATUS_STYLE[value]||"bg-violet-50 text-violet-700"}`}>{value.replaceAll("_"," ")}</span>; }

export function AdminLoading(){return <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white"><span className="flex items-center gap-2 text-sm font-bold text-slate-500"><LoaderCircle className="size-5 animate-spin"/>Đang tải dữ liệu thật...</span></div>}
export function AdminError({message,onRetry}:{message:string;onRetry:()=>void}){return <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700"><CircleAlert className="size-7"/><b>{message}</b><button type="button" onClick={onRetry} className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white">Thử lại</button></div>}
export function EmptyRow({colSpan,label="Chưa có dữ liệu phù hợp."}:{colSpan:number;label?:string}){return <tr><td colSpan={colSpan} className="px-4 py-14 text-center text-sm text-slate-400">{label}</td></tr>}
