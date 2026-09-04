"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name: string;
  photo: string | null;
  className?: string;
  imageClassName?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase() || "US";
}

export function ProfileAvatar({
  name,
  photo,
  className,
  imageClassName,
}: ProfileAvatarProps) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-soft)] font-semibold text-[var(--primary)]",
        className,
      )}
    >
      {photo && failedPhoto !== photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={`Foto de ${name}`}
          onError={() => setFailedPhoto(photo)}
          className={cn("size-full object-cover", imageClassName)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
