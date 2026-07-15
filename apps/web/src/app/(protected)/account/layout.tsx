"use client";

import { ReactNode } from "react";
import { AccountProvider } from "@/features/settings/context/AccountContext";
import { SettingsTopBar } from "@/features/settings/ui/SettingsTopBar";
import { SettingsNav } from "@/features/settings/ui/SettingsNav";
import { useAccount } from "@/features/settings/context/AccountContext";

interface AccountLayoutProps {
  children: ReactNode;
}

function AccountContent({ children }: { children: ReactNode }) {
  const { hasUnsavedChanges, triggerSave, isSaving } = useAccount();

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <SettingsTopBar
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={triggerSave}
        isSaving={isSaving}
      />

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

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <AccountProvider>
      <AccountContent>{children}</AccountContent>
    </AccountProvider>
  );
}
