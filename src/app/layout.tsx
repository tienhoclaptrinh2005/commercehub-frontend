import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/common/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CommerceHub - Chợ sản phẩm số",
    template: "%s | CommerceHub",
  },
  description: "Nền tảng mua bán sản phẩm số an toàn và minh bạch.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
