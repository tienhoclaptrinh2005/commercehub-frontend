import type { ReactNode } from "react";

import { Footer } from "@/components/layout/buyer/Footer";
import { Header } from "@/components/layout/buyer/Header";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9ff]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

