"use client";

type PresenceDotSize = "sm" | "md" | "lg";

const DOT_SIZE: Record<PresenceDotSize, string> = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3.5 h-3.5",
};

interface PresenceDotProps {
  isOnline: boolean;
  size?: PresenceDotSize;
  className?: string;
}

export function PresenceDot({
  isOnline,
  size = "md",
  className = "",
}: PresenceDotProps) {
  return (
    <span
      className={`inline-block rounded-full ${DOT_SIZE[size]} ${
        isOnline ? "bg-online" : "bg-text-muted"
      } ${className}`}
      aria-label={isOnline ? "Online" : "Offline"}
    />
  );
}
