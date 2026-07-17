"use client";

import { useContext } from "react";
import { ReceiptContext } from "../context/ReceiptContext";

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error("useReceipts must be used within a ReceiptProvider");
  }
  return context;
}
