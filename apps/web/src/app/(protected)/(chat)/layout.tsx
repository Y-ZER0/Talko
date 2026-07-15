"use client";

import { ReactNode } from "react";
import { ConversationSidebar } from "@/features/conversations/ui/ConversationSidebar";
import { SocketProvider } from "@/features/presence/context/SocketContext";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden">
        <div className="w-[320px] shrink-0 h-full hidden lg:block">
          <ConversationSidebar />
        </div>
        <main className="flex-1 min-w-0 h-full">{children}</main>
      </div>
    </SocketProvider>
  );
}
