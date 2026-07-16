import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  return <>{children}</>;
}
