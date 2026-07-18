"use client";

interface ConversationHeaderProps {
  avatarLabel: string;
  displayName: string;
  isLoading: boolean;
  statusText?: string;
  online: boolean;
  infoPanelOpen: boolean;
  onToggleInfoPanel: () => void;
  onSearchClick?: () => void;
}

export function ConversationHeader({
  avatarLabel,
  displayName,
  isLoading,
  statusText,
  online,
  infoPanelOpen,
  onToggleInfoPanel,
  onSearchClick,
}: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-text-inverse font-semibold text-sm">
          {avatarLabel}
        </div>
        <div>
          <h2 className="font-semibold text-text">
            {isLoading ? "Loading..." : displayName}
          </h2>
          {statusText && (
            <p
              className={`text-xs ${
                online ? "text-online" : "text-text-muted"
              }`}
            >
              {statusText}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSearchClick}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleInfoPanel}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            infoPanelOpen
              ? "bg-primary-500 text-text-inverse"
              : "text-text-muted hover:bg-surface-muted"
          }`}
          aria-label={infoPanelOpen ? "Close info panel" : "Open info panel"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
