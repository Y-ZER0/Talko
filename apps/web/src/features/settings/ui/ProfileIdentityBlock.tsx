"use client";

interface ProfileIdentityBlockProps {
  displayName: string;
  username: string;
  isOnline?: boolean;
}

export function ProfileIdentityBlock({
  displayName,
  username,
  isOnline = false,
}: ProfileIdentityBlockProps) {
  return (
    <div className="flex items-center justify-between flex-1">
      <div>
        <h2 className="text-xl font-semibold text-text m-0 leading-tight">
          {displayName}
        </h2>
        <p className="text-sm text-text-muted m-1">@{username}</p>
      </div>

      {isOnline && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-online/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-online" />
          <span className="font-mono text-[11px] font-semibold text-online tracking-label uppercase">
            Online
          </span>
        </div>
      )}
    </div>
  );
}
