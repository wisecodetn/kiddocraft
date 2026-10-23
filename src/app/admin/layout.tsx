import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin KiddoCraft" },
  robots: { index: false, follow: false },
};

// The admin is French only and lives outside the [locale] tree.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={fontVariables}>
      <body className="min-h-dvh bg-cloud">{children}</body>
    </html>
  );
}
