"use client";

import { CheckCircle2, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const fieldClassName =
  "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10";

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    if (!captchaChecked) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    // Mock submit: thay khối này bằng API liên hệ khi backend được triển khai.
    await new Promise((resolve) => window.setTimeout(resolve, 650));

    form.reset();
    setCaptchaChecked(false);
    setStatus("success");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
          Hỗ trợ trực tuyến
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-slate-950">
          Gửi tin nhắn cho chúng tôi
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Điền thông tin bên dưới, đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Họ và tên <span className="text-rose-500">*</span>
            <input
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="Tên của bạn"
              className={fieldClassName}
              onChange={() => status !== "idle" && setStatus("idle")}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Địa chỉ email <span className="text-rose-500">*</span>
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="email@example.com"
              className={fieldClassName}
              onChange={() => status !== "idle" && setStatus("idle")}
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Số điện thoại
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            maxLength={20}
            autoComplete="tel"
            pattern="[0-9+() .-]{8,20}"
            title="Số điện thoại gồm 8 đến 20 ký tự hợp lệ."
            placeholder="Số điện thoại của bạn"
            className={fieldClassName}
            onChange={() => status !== "idle" && setStatus("idle")}
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Lời nhắn <span className="text-rose-500">*</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            placeholder="Bạn cần hỗ trợ vấn đề gì?"
            className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
            onChange={() => status !== "idle" && setStatus("idle")}
          />
          <span className="mt-1.5 block text-right text-xs font-normal text-slate-400">
            Tối đa 2.000 ký tự
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-600">
          <input
            name="acceptedTerms"
            type="checkbox"
            required
            className="mt-0.5 size-4 rounded border-slate-300 accent-emerald-600"
          />
          <span>
            Tôi đã đọc và đồng ý với{" "}
            <Link href="/terms" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Điều khoản dịch vụ
            </Link>
            .
          </span>
        </label>

        <div>
          <label className="flex max-w-sm cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300">
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={captchaChecked}
                onChange={(event) => {
                  setCaptchaChecked(event.target.checked);
                  if (status === "error") setStatus("idle");
                }}
                className="size-5 accent-emerald-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Tôi không phải là người máy
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  Kiểm tra mô phỏng
                </span>
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-center text-emerald-700">
              <ShieldCheck className="size-7" />
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide">Captcha</span>
            </span>
          </label>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            CAPTCHA hiện chỉ là giao diện. Trước khi đưa lên production cần tích hợp dịch vụ xác minh thật ở cả frontend và backend.
          </p>
        </div>

        {status === "error" ? (
          <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700" role="alert">
            Vui lòng hoàn thành ô kiểm tra CAPTCHA mô phỏng.
          </p>
        ) : null}

        {status === "success" ? (
          <div
            className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p>
              Tin nhắn demo đã được ghi nhận. Hiện tại dữ liệu chưa được gửi hoặc lưu vào backend.
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {status === "submitting" ? "Đang gửi..." : "Gửi tin nhắn"}
        </button>
      </form>
    </section>
  );
}
