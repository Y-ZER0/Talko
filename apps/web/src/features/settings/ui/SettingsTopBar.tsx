"use client";

export function SettingsTopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-bg border-b border-border">
      <div className="flex items-center gap-3">
        <a
          href="/"
          aria-label="Back to chat"
          className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text no-underline hover:bg-border transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </a>

        <div className="w-10 h-10 rounded-xl bg-text flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <div>
          <h1 className="text-lg font-semibold text-text leading-tight m-0">
            Account
          </h1>
          <p className="text-[11px] font-medium text-text-muted tracking-label uppercase m-0.5">
            Profile & Settings
          </p>
        </div>
      </div>
    </header>
  );
}
