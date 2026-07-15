"use client";

interface ProfileCoverBannerProps {
  coverUrl?: string | null;
  onUpload?: () => void;
}

export function ProfileCoverBanner({
  coverUrl,
  onUpload,
}: ProfileCoverBannerProps) {
  return (
    <div
      className="relative w-full h-44 rounded-2xl overflow-hidden"
      style={{
        background: coverUrl
          ? `url(${coverUrl}) center/cover`
          : "linear-gradient(135deg, #E8562E 0%, #C98F1E 50%, #1C9BB5 100%)",
      }}
    >
      <button
        onClick={onUpload}
        aria-label="Change cover photo"
        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 bg-black/70 text-white rounded-lg border-none cursor-pointer font-mono text-[11px] font-medium tracking-label uppercase hover:bg-black/80 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        Cover
      </button>
    </div>
  );
}
