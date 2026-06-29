import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  if (!(await isAdmin())) redirect("/admin");

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminNav active="subscribers" />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl">Subscribers</h1>
          <span className="font-body rounded-full border border-ivory/10 px-4 py-1.5 text-xs text-ivory/50">
            {subscribers.length} total
          </span>
        </div>

        {subscribers.length === 0 ? (
          <p className="font-body text-ivory/50">No subscribers yet.</p>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <a
                href={`data:text/csv;charset=utf-8,Email,Source,Date\n${subscribers.map((s) => `${s.email},${s.source},${s.createdAt.toISOString()}`).join("\n")}`}
                download="biolumin-subscribers.csv"
                className="font-body rounded-full border border-ivory/20 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-ivory/60 transition-colors hover:border-champagne hover:text-champagne"
              >
                Export CSV
              </a>
            </div>

            <div className="overflow-x-auto rounded-sm border border-ivory/10">
              <table className="w-full min-w-[480px] text-left">
                <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="font-body divide-y divide-ivory/10 text-sm">
                  {subscribers.map((s) => (
                    <tr key={s.id} className="hover:bg-obsidian-soft/20">
                      <td className="px-4 py-3 text-ivory">{s.email}</td>
                      <td className="px-4 py-3 text-ivory/50">{s.source}</td>
                      <td className="px-4 py-3 text-ivory/40">
                        {new Date(s.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}
