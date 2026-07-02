import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-actions";
import { OrderNotifier } from "@/components/admin/OrderNotifier";

export const metadata: Metadata = {
  title: "Biolumin · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mount the "cha-ching" order notifier across the WHOLE admin (not just the
  // orders page) so a new sale chimes wherever the owner happens to be. Only
  // for signed-in admins — the login screen stays clean.
  const admin = await isAdmin();
  const initialTotal = admin ? await prisma.order.count() : 0;

  return (
    <html lang="en" dir="ltr" className={fontVars}>
      <body className="min-h-screen bg-obsidian text-ivory antialiased">
        {admin && <OrderNotifier initialTotal={initialTotal} />}
        {children}
      </body>
    </html>
  );
}
