import { UserRound } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  fullName: string;
  className?: string;
}

export function ProfileAvatar({ avatarUrl, fullName, className }: ProfileAvatarProps) {
  return (
    <span
      className={cn(
        "relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow-lg",
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Ảnh đại diện của ${fullName}`}
          fill
          sizes="128px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <UserRound className="size-1/2" strokeWidth={1.5} />
      )}
    </span>
  );
}
