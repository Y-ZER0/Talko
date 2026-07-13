import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppProviders } from "@/shared/context/AppProviders";

export const metadata: Metadata = {
  title: "Talko",
  description: "Real-time messaging for teams",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
