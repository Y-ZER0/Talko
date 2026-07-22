"use client";

import { useState, useRef, useEffect } from "react";

const QUICK_EMOJI = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉"];

interface MessageActionsProps {
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
}

export function MessageActions({ isOwn, onEdit, onDelete, onReact, onReply }: MessageActionsProps) {
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const emojiBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (!showEmojiBar) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiBarRef.current && !emojiBarRef.current.contains(e.target as Node)) {
        setShowEmojiBar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiBar]);

  return (
    <div className="relative">
      {/* Reaction bar on hover */}
      {showEmojiBar && (
        <div ref={emojiBarRef} className="absolute bottom-full mb-1.5 left-0 flex items-center gap-0.5 bg-surface border border-border rounded-full px-1.5 py-1 shadow-lg z-10">
          {QUICK_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(emoji);
                setShowEmojiBar(false);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-surface-muted hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowEmojiBar(false);
              setShowMenu(true);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors text-xs font-semibold"
          >
            +
          </button>
        </div>
      )}

      {/* Three-dot menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-full mt-1.5 right-0 bg-surface border border-border rounded-xl shadow-lg z-10 py-1.5 min-w-[150px]"
        >
          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onReply();
            }}
            className="w-full px-3.5 py-2 text-left text-sm text-text hover:bg-surface-muted transition-colors flex items-center gap-2.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            Reply
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onReact("👍");
            }}
            className="w-full px-3.5 py-2 text-left text-sm text-text hover:bg-surface-muted transition-colors flex items-center gap-2.5"
          >
            <span>👍</span> React
          </button>
          {isOwn && (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full px-3.5 py-2 text-left text-sm text-text hover:bg-surface-muted transition-colors flex items-center gap-2.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full px-3.5 py-2 text-left text-sm text-danger hover:bg-danger-bg transition-colors flex items-center gap-2.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Hover trigger buttons — inline flex items, no overflow */}
      {!showEmojiBar && !showMenu && (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onReply}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted bg-surface shadow-sm border border-border md:bg-transparent md:shadow-none md:border-transparent hover:bg-surface-muted transition-colors"
            aria-label="Reply"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiBar(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted bg-surface shadow-sm border border-border md:bg-transparent md:shadow-none md:border-transparent hover:bg-surface-muted transition-colors"
            aria-label="React"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          {isOwn && (
            <button
              type="button"
              onClick={() => setShowMenu(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted bg-surface shadow-sm border border-border md:bg-transparent md:shadow-none md:border-transparent hover:bg-surface-muted transition-colors"
              aria-label="More options"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}