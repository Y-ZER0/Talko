"use client";

const ACCENT_COLORS = [
  "bg-accent-orange",
  "bg-accent-teal",
  "bg-accent-purple",
  "bg-accent-green",
  "bg-accent-pink",
  "bg-accent-gold",
  "bg-accent-blue",
  "bg-accent-coral",
];

const ACCENT_HEX = [
  "#E8562E",
  "#1C9BB5",
  "#8F6FE0",
  "#1FAA6B",
  "#D6548F",
  "#C98F1E",
  "#2E86DE",
  "#D9573F",
];

function getAccentIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % ACCENT_HEX.length;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type AvatarSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-24 h-24 text-3xl",
};

const DOT_SIZE: Record<AvatarSize, string> = {
  sm: "w-2.5 h-2.5 -bottom-0.5 -left-0.5",
  md: "w-2.5 h-2.5 bottom-0 left-0",
  lg: "w-4 h-4 bottom-1 left-1",
};

interface AvatarProps {
  name: string;
  userId: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  showPresenceDot?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function Avatar({
  name,
  userId,
  imageUrl,
  size = "md",
  showPresenceDot = false,
  isOnline = false,
  className = "",
}: AvatarProps) {
  const idx = getAccentIndex(userId);
  const bgColor = ACCENT_HEX[idx];
  const initials = getInitials(name);

  return (
    <div className={`relative shrink-0 ${SIZE_CLASSES[size]} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}

      {showPresenceDot && (
        <span
          className={`absolute rounded-full border-2 border-surface ${DOT_SIZE[size]} ${
            isOnline ? "bg-online" : "bg-text-muted"
          }`}
        />
      )}
    </div>
  );
}
