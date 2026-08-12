import type { UserRole } from "@/types";

interface UserRoleBadgesProps {
  roles?: UserRole[];
}

const ROLE_PRESENTATION: Record<UserRole, { label: string; className: string }> = {
  BUYER: {
    label: "MEMBER",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  SELLER: {
    label: "SELLER",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  ADMIN: {
    label: "ADMIN",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const ROLE_ORDER: UserRole[] = ["BUYER", "SELLER", "ADMIN"];

export function UserRoleBadges({ roles = [] }: UserRoleBadgesProps) {
  const visibleRoles = ROLE_ORDER.filter((role) => roles.includes(role));

  if (visibleRoles.length === 0) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" aria-label="Vai trò tài khoản">
      {visibleRoles.map((role) => {
        const presentation = ROLE_PRESENTATION[role];

        return (
          <span
            key={role}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.05em] ${presentation.className}`}
          >
            {presentation.label}
          </span>
        );
      })}
    </span>
  );
}
