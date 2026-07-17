"use client";

interface ProfileCoverBannerProps {
  coverUrl?: string | null;
}

export function ProfileCoverBanner({
  coverUrl,
}: ProfileCoverBannerProps) {
  return (
    <div
      className="relative w-full h-44 rounded-2xl overflow-hidden"
      style={{
        background: coverUrl
          ? `url(${coverUrl}) center/cover`
          : "linear-gradient(135deg, #E8562E 0%, #C98F1E 50%, #1C9BB5 100%)",
      }}
    />
  );
}
