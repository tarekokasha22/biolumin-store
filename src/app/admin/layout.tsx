import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-actions";
import { OrderNotifier } from "@/components/admin/OrderNotifier";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Biolumin · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  let initialTotal = 0;
  let pendingOrders = 0;

  if (admin) {
    try {
      [initialTotal, pendingOrders] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
      ]);
    } catch {
      // Graceful fallback if database connection or env vars are missing
    }
  }

  return (
    <html lang="en" dir="ltr" className={fontVars}>
      <body className="min-h-screen bg-obsidian text-ivory antialiased">
        {admin && <OrderNotifier initialTotal={initialTotal} />}

        {admin ? (
          /* ── Authenticated: sidebar shell ── */
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <AdminSidebar pendingOrders={pendingOrders} />

            {/* Main content — offset by sidebar width on desktop */}
            <div className="flex-1 min-w-0 md:ml-[220px] transition-all duration-300">
              {children}
            </div>
          </div>
        ) : (
          /* ── Login screen — full page, no sidebar ── */
          children
        )}
      </body>
    </html>
  );
}
