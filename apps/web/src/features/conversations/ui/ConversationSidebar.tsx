"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useConversations } from "../hooks/useConversations";
import { ConversationListItem } from "./ConversationListItem";
import { CurrentUserBar } from "./CurrentUserBar";
import { NewConversationModal } from "./NewConversationModal";

type TabFilter = "all" | "unread" | "groups";

export function ConversationSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: conversations, isLoading } = useConversations();
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
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-text flex items-center justify-center">
            <svg
              width="16"
              height="16"
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
            <h1 className="text-sm font-semibold text-text leading-tight">
              Talko
            </h1>
            <p className="text-[10px] font-mono text-online tracking-label uppercase">
              Connected
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsNewConversationOpen(true)}
          className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-muted hover:bg-surface hover:text-text transition-colors"
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

      <div className="px-4 pb-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="14"
            height="14"
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
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl font-sans text-sm text-text placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
          />
        </div>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {(["all", "unread", "groups"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-surface text-text"
                : "bg-transparent text-text-muted hover:bg-surface-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-text-muted text-sm">
            Loading conversations...
          </div>
        ) : searched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted text-sm gap-1">
            <p>No conversations found</p>
          </div>
        ) : (
          searched.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              isActive={c.id === activeConversationId}
              onClick={() => router.push(`/${c.id}`)}
            />
          ))
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
