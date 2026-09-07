"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buyerNavigation } from "./navigation";

function isNavigationActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CategoryBar() {
  const pathname = usePathname();

  return (
    <nav className="hidden bg-emerald-800 text-white lg:block" aria-label="Danh mục chính">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 xl:gap-7">
        {buyerNavigation.map((item) => {
          const isActive = isNavigationActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative whitespace-nowrap py-4 text-[13px] font-semibold transition hover:text-emerald-200 xl:text-sm ${
                isActive
                  ? "after:absolute after:inset-x-0 after:bottom-2.5 after:h-0.5 after:bg-white"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
