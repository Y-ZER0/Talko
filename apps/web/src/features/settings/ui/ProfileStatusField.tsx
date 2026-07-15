"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface ProfileStatusFieldProps {
  initialStatus?: string;
}

export function ProfileStatusField({ initialStatus = "" }: ProfileStatusFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { setValue, watch } = useFormContext();
  const value = watch("status") || initialStatus;

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue("status", initialStatus);
      setIsEditing(false);
    }
  };

  return (
    <div className="mt-6">
      <label className="block text-[11px] font-medium text-text-muted tracking-label uppercase mb-2">
        Status
      </label>

      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue("status", e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          maxLength={120}
          autoFocus
          className="w-full px-4 py-3 bg-surface border border-border rounded-xl font-sans text-base text-text outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center justify-between w-full px-4 py-3 bg-surface border border-border rounded-xl cursor-pointer text-left hover:border-primary-500/50 transition-colors"
        >
          <span
            className={`font-sans text-base ${
              value ? "text-text" : "text-text-muted"
            }`}
          >
            {value || "Set a status..."}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A8478"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
