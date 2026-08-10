"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type GoogleIdentityStatus = "loading" | "ready" | "error" | "unconfigured";

interface GoogleIdentityContextValue {
  status: GoogleIdentityStatus;
  setCredentialHandler: (handler: ((credential: string) => void) | null) => void;
}

const GoogleIdentityContext = createContext<GoogleIdentityContextValue | null>(null);
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

export function GoogleIdentityProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GoogleIdentityStatus>(
    GOOGLE_CLIENT_ID ? "loading" : "unconfigured",
  );
  const initializedRef = useRef(false);
  const credentialHandlerRef = useRef<((credential: string) => void) | null>(null);

  const setCredentialHandler = useCallback(
    (handler: ((credential: string) => void) | null) => {
      credentialHandlerRef.current = handler;
    },
    [],
  );

  const initializeGoogleIdentity = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || initializedRef.current) return;

    const googleIdentity = window.google?.accounts.id;
    if (!googleIdentity) {
      setStatus("error");
      return;
    }

    googleIdentity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "popup",
      auto_select: false,
      callback: (response) => {
        if (response.credential) {
          credentialHandlerRef.current?.(response.credential);
        }
      },
    });

    initializedRef.current = true;
    setStatus("ready");
  }, []);

  const contextValue = useMemo(
    () => ({ status, setCredentialHandler }),
    [status, setCredentialHandler],
  );

  return (
    <GoogleIdentityContext.Provider value={contextValue}>
      {children}
      {GOOGLE_CLIENT_ID ? (
        <Script
          id="google-identity-services"
          src="https://accounts.google.com/gsi/client?hl=vi"
          strategy="afterInteractive"
          onReady={initializeGoogleIdentity}
          onError={() => setStatus("error")}
        />
      ) : null}
    </GoogleIdentityContext.Provider>
  );
}

export function useGoogleIdentity(): GoogleIdentityContextValue {
  const context = useContext(GoogleIdentityContext);
  if (!context) {
    throw new Error("useGoogleIdentity phải được dùng trong GoogleIdentityProvider");
  }
  return context;
}
