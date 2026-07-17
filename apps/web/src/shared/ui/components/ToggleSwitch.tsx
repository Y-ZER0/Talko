"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  "aria-label"?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-surface
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-primary-500" : "bg-border"}
      `}
      style={{ width: "var(--toggle-track-width)", height: "var(--toggle-track-height)" }}
    >
      <span
        className={`
          pointer-events-none inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
        style={{ width: "20px", height: "20px", marginTop: "2px" }}
      />
    </button>
  );
}
