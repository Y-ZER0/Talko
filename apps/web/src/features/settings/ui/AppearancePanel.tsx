"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ACCENT_COLORS = [
  { name: "Orange", hex: "#E8562E" },
  { name: "Teal", hex: "#1C9BB5" },
  { name: "Purple", hex: "#8F6FE0" },
  { name: "Green", hex: "#1FAA6B" },
  { name: "Pink", hex: "#D6548F" },
  { name: "Gold", hex: "#C98F1E" },
  { name: "Blue", hex: "#2E86DE" },
  { name: "Coral", hex: "#D9573F" },
];

const STORAGE_KEY_ACCENT = "talko-accent";

const THEME_OPTIONS = [
  {
    value: "light" as const,
    label: "Light",
    bg: "#F4EFE6",
    surface: "#FFFFFF",
    text: "#1C1B19",
  },
  {
    value: "dark" as const,
    label: "Dark",
    bg: "#0D0D0E",
    surface: "#1A1A1B",
    text: "#EDEDED",
  },
  {
    value: "dim" as const,
    label: "Dim",
    bg: "#1A2233",
    surface: "#222D3F",
    text: "#E8ECF1",
  },
];

function getSavedAccent(): string {
  if (typeof window === "undefined") return ACCENT_COLORS[0].hex;
  return localStorage.getItem(STORAGE_KEY_ACCENT) || ACCENT_COLORS[0].hex;
}

function saveAccent(hex: string) {
  localStorage.setItem(STORAGE_KEY_ACCENT, hex);
  document.documentElement.style.setProperty("--color-primary-500", hex);
}

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState(ACCENT_COLORS[0].hex);

  useEffect(() => {
    setMounted(true);
    const saved = getSavedAccent();
    setAccent(saved);
    document.documentElement.style.setProperty("--color-primary-500", saved);
  }, []);

  const handleAccentChange = (hex: string) => {
    setAccent(hex);
    saveAccent(hex);
  };

  if (!mounted) {
    return (
      <div className="bg-surface rounded-2xl p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-[3px] border-border border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-text m-0 mb-1">Appearance</h2>
      <p className="text-xs text-text-muted m-0 mb-6">
        Customize the look and feel of Talko.
      </p>

      <div className="mb-8">
        <p className="text-[11px] font-medium text-text-muted tracking-label uppercase mb-3">
          Theme
        </p>
        <div className="flex gap-3">
          {THEME_OPTIONS.map((option) => {
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer bg-transparent ${
                  isActive
                    ? "border-primary-500"
                    : "border-border hover:border-primary-500/50"
                }`}
              >
                <div
                  className="w-20 h-14 rounded-lg overflow-hidden flex flex-col"
                  style={{ backgroundColor: option.bg }}
                >
                  <div
                    className="h-2 mx-1 mt-1 rounded-sm"
                    style={{ backgroundColor: option.surface }}
                  />
                  <div className="flex-1 flex items-center justify-center px-1">
                    <div
                      className="w-full h-1.5 rounded-sm"
                      style={{ backgroundColor: option.text, opacity: 0.3 }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-text">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium text-text-muted tracking-label uppercase mb-3">
          Accent color
        </p>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((color) => {
            const isActive = accent === color.hex;
            return (
              <button
                key={color.hex}
                onClick={() => handleAccentChange(color.hex)}
                aria-label={`Select ${color.name} accent`}
                className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-text scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
