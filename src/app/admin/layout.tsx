import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Biolumin · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={fontVars}>
      <body className="min-h-screen bg-obsidian text-ivory antialiased">
        {children}
      </body>
    </html>
  );
}
