"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AccountContextValue {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  registerSaveHandler: (handler: () => Promise<void>) => void;
  triggerSave: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveHandler, setSaveHandler] = useState<(() => Promise<void>) | null>(null);

  const registerSaveHandler = useCallback((handler: () => Promise<void>) => {
    setSaveHandler(() => handler);
  }, []);

  const triggerSave = useCallback(async () => {
    if (!saveHandler || isSaving) return;
    setIsSaving(true);
    try {
      await saveHandler();
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, [saveHandler, isSaving]);

  return (
    <AccountContext.Provider
      value={{
        hasUnsavedChanges,
        isSaving,
        setHasUnsavedChanges,
        setIsSaving,
        registerSaveHandler,
        triggerSave,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
