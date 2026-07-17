"use client";

import { ReactNode } from "react";
import { SettingsTopBar } from "@/features/settings/ui/SettingsTopBar";
import { SettingsNav } from "@/features/settings/ui/SettingsNav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <SettingsTopBar />

      <div className="flex flex-1 p-6 gap-6 max-w-[1280px] w-full mx-auto">
        <aside className="w-60 shrink-0">
          <SettingsNav />
        </aside>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
