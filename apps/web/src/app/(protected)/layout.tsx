import { auth } from "@clerk/nextjs/server";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  auth.protect();
  return <>{children}</>;
}
