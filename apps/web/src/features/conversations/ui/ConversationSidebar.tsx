"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useConversations } from "../hooks/useConversations";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { ConversationListItem } from "./ConversationListItem";
import { CurrentUserBar } from "./CurrentUserBar";
import { NewConversationModal } from "./NewConversationModal";

type TabFilter = "all" | "unread" | "groups";

export function ConversationSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: conversations, isLoading } = useConversations();
  const { data: profile } = useCurrentUserProfile();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const activeConversationId = pathname.match(
    /\(chat\)\/([^/]+)/,
  )?.[1] ?? null;

  const filtered = (conversations ?? []).filter((c) => {
    if (activeTab === "unread") return c.unreadCount > 0;
    if (activeTab === "groups") return c.isGroup;
    return true;
  });

  const searched = filtered.filter((c) => {
    if (!searchQuery.trim()) return true;
    const name = c.isGroup
      ? c.groupName ?? ""
      : c.members.map((m) => m.user.username).join(" ");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <aside className="flex flex-col h-full bg-bg border-r border-border">
      {/* Brand header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-text flex items-center justify-center shadow-sm">
            <svg
              width="17"
              height="17"
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
            <h1 className="text-sm font-semibold text-text leading-tight tracking-tight">
              Talko
            </h1>
            <p className="flex items-center gap-1 text-[10px] font-mono text-online tracking-label uppercase mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-online animate-pulse" />
              Connected
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsNewConversationOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted bg-surface-muted hover:bg-primary-500 hover:text-text-inverse active:scale-95 transition-all duration-150"
          aria-label="New conversation"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl font-sans text-sm text-text placeholder:text-text-muted outline-none transition-shadow focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 px-5 pb-4">
        {(["all", "unread", "groups"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-text text-text-inverse"
                : "bg-transparent text-text-muted hover:bg-surface-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-muted shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-2.5 w-24 rounded-full bg-surface-muted" />
                  <div className="h-2 w-36 rounded-full bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : searched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text">No conversations found</p>
              <p className="text-xs text-text-muted mt-0.5">
                {searchQuery ? "Try a different search term" : "Start a new conversation to get going"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 pb-2">
            {searched.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                isActive={c.id === activeConversationId}
                onClick={() => router.push(`/${c.id}`)}
                currentUserId={profile?.id}
              />
            ))}
          </div>
        )}
      </div>

      <CurrentUserBar />

      <NewConversationModal
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onConversationCreated={(id) => {
          router.push(`/${id}`);
          setIsNewConversationOpen(false);
        }}
      />
    </aside>
  );
}