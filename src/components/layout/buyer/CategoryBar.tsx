import Link from "next/link";

import { buyerNavigation } from "./navigation";

export function CategoryBar() {
  return (
    <nav className="hidden bg-emerald-800 text-white lg:block" aria-label="Danh mục chính">
      <div className="mx-auto flex max-w-[1200px] items-center gap-9 px-6">
        {buyerNavigation.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative py-4 text-sm font-semibold transition hover:text-emerald-200 ${
              index === 0
                ? "after:absolute after:inset-x-0 after:bottom-2.5 after:h-0.5 after:bg-white"
                : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

