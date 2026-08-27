"use client";

import {
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ModalVariant = "success" | "error" | "info" | "confirm";

interface BaseModalOptions {
  title: string;
  description?: string;
  details?: ReactNode;
  confirmLabel?: string;
}

interface ConfirmModalOptions extends BaseModalOptions {
  cancelLabel?: string;
  danger?: boolean;
}

interface ModalState extends ConfirmModalOptions {
  variant: ModalVariant;
}

interface AppModalContextValue {
  showSuccess: (options: BaseModalOptions) => void;
  showError: (options: BaseModalOptions) => void;
  showInfo: (options: BaseModalOptions) => void;
  confirm: (options: ConfirmModalOptions) => Promise<boolean>;
  close: () => void;
}

const AppModalContext = createContext<AppModalContextValue | null>(null);

const VARIANT_STYLES = {
  success: {
    Icon: CheckCircle2,
    icon: "border-emerald-200 bg-emerald-50 text-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600/25",
  },
  error: {
    Icon: CircleAlert,
    icon: "border-rose-200 bg-rose-50 text-rose-600",
    button: "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600/25",
  },
  info: {
    Icon: Info,
    icon: "border-sky-200 bg-sky-50 text-sky-600",
    button: "bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-600/25",
  },
  confirm: {
    Icon: CircleHelp,
    icon: "border-violet-200 bg-violet-50 text-violet-600",
    button: "bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-600/25",
  },
} as const;

export function AppModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const finish = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setModal(null);
  }, []);

  const open = useCallback((nextModal: ModalState) => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setModal(nextModal);
  }, []);

  const showSuccess = useCallback(
    (options: BaseModalOptions) => open({ ...options, variant: "success" }),
    [open],
  );
  const showError = useCallback(
    (options: BaseModalOptions) => open({ ...options, variant: "error" }),
    [open],
  );
  const showInfo = useCallback(
    (options: BaseModalOptions) => open({ ...options, variant: "info" }),
    [open],
  );
  const confirm = useCallback(
    (options: ConfirmModalOptions) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setModal({ ...options, variant: "confirm" });
      }),
    [],
  );

  const value = useMemo<AppModalContextValue>(
    () => ({
      showSuccess,
      showError,
      showInfo,
      confirm,
      close: () => finish(false),
    }),
    [confirm, finish, showError, showInfo, showSuccess],
  );

  return (
    <AppModalContext.Provider value={value}>
      {children}
      {modal ? <AppModal modal={modal} onFinish={finish} /> : null}
    </AppModalContext.Provider>
  );
}

export function useAppModal() {
  const context = useContext(AppModalContext);
  if (!context) {
    throw new Error("useAppModal phải được dùng bên trong AppModalProvider");
  }
  return context;
}

function AppModal({
  modal,
  onFinish,
}: {
  modal: ModalState;
  onFinish: (result: boolean) => void;
}) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isConfirmation = modal.variant === "confirm";
  const style = VARIANT_STYLES[modal.variant];
  const { Icon } = style;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    if (modal.danger) cancelButtonRef.current?.focus();
    else primaryButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onFinish(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [modal.danger, onFinish]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onFinish(false);
      }}
    >
      <section
        role={modal.variant === "error" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="app-modal-title"
        aria-describedby={modal.description ? "app-modal-description" : undefined}
        className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white px-6 py-7 text-center shadow-2xl shadow-slate-950/25 sm:px-8 sm:py-8"
      >
        <button
          type="button"
          onClick={() => onFinish(false)}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Đóng thông báo"
        >
          <X className="size-4" />
        </button>

        <span
          className={`mx-auto grid size-20 place-items-center rounded-full border-2 ${style.icon}`}
        >
          <Icon className="size-10" strokeWidth={1.8} />
        </span>

        <h2
          id="app-modal-title"
          className="mt-5 text-2xl font-black tracking-[-0.035em] text-slate-950"
        >
          {modal.title}
        </h2>

        {modal.description ? (
          <p
            id="app-modal-description"
            className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500"
          >
            {modal.description}
          </p>
        ) : null}

        {modal.details ? (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-700">
            {modal.details}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col-reverse justify-center gap-2.5 sm:flex-row">
          {isConfirmation ? (
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={() => onFinish(false)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            >
              {modal.cancelLabel ?? "Hủy"}
            </button>
          ) : null}
          <button
            ref={primaryButtonRef}
            type="button"
            onClick={() => onFinish(true)}
            className={`inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-black text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-4 ${
              modal.danger
                ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600/25"
                : style.button
            }`}
          >
            {modal.confirmLabel ?? (isConfirmation ? "Xác nhận" : "Đóng")}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
