"use client";

import { ReactNode } from "react";
import { ConversationSidebar } from "@/features/conversations/ui/ConversationSidebar";
import { SocketProvider } from "@/features/presence/context/SocketContext";
import { PresenceProvider } from "@/features/presence/context/PresenceContext";
import { TypingProvider } from "@/features/typing/context/TypingContext";
import { NotificationPermissionPrompt } from "@/features/notifications/ui/NotificationPermissionPrompt";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <TypingProvider>
        <PresenceProvider>
          <div className="flex h-screen overflow-hidden">
            <div className="w-[320px] shrink-0 h-full hidden lg:block">
              <ConversationSidebar />
            </div>
            <main className="flex-1 min-w-0 h-full">{children}</main>
          </div>
          <NotificationPermissionPrompt />
        </PresenceProvider>
      </TypingProvider>
    </SocketProvider>
  );
}
