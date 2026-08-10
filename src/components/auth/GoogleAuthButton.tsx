"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/hooks/auth/useAuth";

import { useGoogleIdentity } from "./GoogleIdentityProvider";

interface GoogleAuthButtonProps {
  mode: "login" | "register";
}

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const lastRenderedWidthRef = useRef(0);
  const { googleLogin, isSubmitting } = useAuth();
  const { status, setCredentialHandler } = useGoogleIdentity();

  const handleCredential = useCallback(
    async (credential: string) => {
      try {
        await googleLogin(credential);
        router.replace("/");
      } catch {
        // Lỗi API đã được chuẩn hóa và hiển thị bởi auth store.
      }
    },
    [googleLogin, router],
  );

  useEffect(() => {
    if (status !== "ready") return;

    const container = buttonContainerRef.current;
    const googleIdentity = window.google?.accounts.id;
    if (!container || !googleIdentity) return;

    setCredentialHandler(handleCredential);

    const renderButton = () => {
      const width = Math.min(Math.floor(container.clientWidth), 400);
      if (width < 200 || width === lastRenderedWidthRef.current) return;

      lastRenderedWidthRef.current = width;
      container.replaceChildren();
      googleIdentity.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: mode === "register" ? "signup_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width,
        locale: "vi",
      });
    };

    renderButton();
    const resizeObserver = new ResizeObserver(renderButton);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      setCredentialHandler(null);
      lastRenderedWidthRef.current = 0;
      container.replaceChildren();
    };
  }, [handleCredential, mode, setCredentialHandler, status]);

  if (status === "unconfigured") {
    return (
      <div
        className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800"
        role="alert"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>
          Chưa cấu hình <code className="font-semibold">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
        </span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        role="alert"
      >
        <AlertCircle className="size-4" />
        Không thể tải đăng nhập Google. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-11 w-full justify-center" aria-busy={status === "loading" || isSubmitting}>
      {status === "loading" ? (
        <div className="h-11 w-full max-w-[400px] animate-pulse rounded-md border border-slate-200 bg-slate-50" />
      ) : (
        <div ref={buttonContainerRef} className="min-h-11 w-full max-w-[400px]" />
      )}
      {status === "ready" && isSubmitting ? (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-md bg-white/75 backdrop-blur-[1px]">
          <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" aria-label="Đang đăng nhập bằng Google" />
        </div>
      ) : null}
    </div>
  );
}
