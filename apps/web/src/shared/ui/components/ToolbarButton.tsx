"use client";

interface ToolbarButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  variant?: "default" | "primary";
  children: React.ReactNode;
}

export function ToolbarButton({
  onClick,
  disabled,
  label,
  variant = "default",
  children,
}: ToolbarButtonProps) {
  const base = "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-50";
  const styles = variant === "primary"
    ? "bg-primary-500 text-text-inverse hover:bg-primary-600 disabled:cursor-not-allowed"
    : "text-text-muted hover:bg-surface-muted";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
