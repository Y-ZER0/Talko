"use client";

import { useEffect, useRef, useState } from "react";

export function InlineEditor({
  originalContent,
  onSave,
  onCancel,
}: {
  originalContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(originalContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, []);

  const handleSubmit = () => {
    if (value.trim()) onSave(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-[420px] overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-text mb-3">Edit message</h3>
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-surface-muted rounded-xl border border-border">
            <div className="w-0.5 self-stretch rounded-full bg-primary-500 shrink-0" />
            <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
              {originalContent}
            </p>
          </div>
        </div>
        <div className="px-5 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-xl text-sm text-text resize-none outline-none transition-shadow focus:border-primary-500/40 focus:ring-4 focus:ring-primary-500/10"
            style={{ maxHeight: "160px" }}
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || value.trim() === originalContent.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-inverse bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
