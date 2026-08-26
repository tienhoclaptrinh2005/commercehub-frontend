import Link from "next/link";

export default function AdminPage() {
  return <main className="mx-auto max-w-[1500px] p-6 lg:p-8"><div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-violet-700">Quản trị sàn</p><h1 className="mt-2 text-3xl font-black">Trang quản trị</h1><Link href="/admin/disputes" className="mt-6 inline-flex h-11 items-center rounded-xl bg-violet-600 px-5 text-sm font-bold text-white">Xử lý khiếu nại</Link></div></main>;
}
