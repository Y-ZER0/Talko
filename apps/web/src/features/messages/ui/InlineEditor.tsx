"use client";

import { useEffect, useRef, useState } from "react";

export function InlineEditor({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialContent);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSave(value.trim());
    }
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center">
      <div className="flex flex-col gap-1.5 bg-surface border border-primary-500 rounded-2xl shadow-lg p-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          className="w-full px-2.5 py-1.5 bg-surface-muted rounded-xl text-sm text-text resize-none outline-none"
          style={{ maxHeight: "120px" }}
        />
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              onCancel();
              setValue(initialContent);
            }}
            className="px-2 py-0.5 rounded-md text-xs text-text-muted hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => value.trim() && onSave(value.trim())}
            disabled={!value.trim()}
            className="px-2 py-0.5 rounded-md text-xs font-medium text-text-inverse bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
