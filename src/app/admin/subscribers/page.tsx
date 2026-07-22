import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  if (!(await isAdmin())) redirect("/admin");

  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  const csvData = `data:text/csv;charset=utf-8,Email,Source,Date\n${subscribers
    .map((s) => `${s.email},${s.source},${s.createdAt.toISOString()}`)
    .join("\n")}`;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ivory">Subscribers</h1>
          <p className="font-body mt-1 text-[12px] text-ivory/35">Email list from newsletter sign-ups</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body rounded-full border border-ivory/8 px-4 py-1.5 text-xs text-ivory/40">
            {subscribers.length} total
          </span>
          {subscribers.length > 0 && (
            <a
              href={csvData}
              download="biolumin-subscribers.csv"
              className="font-body rounded-full border border-ivory/15 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-ivory/55 hover:border-champagne/40 hover:text-champagne transition-colors"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-ivory/8 bg-obsidian-soft/30">
          <p className="font-body text-ivory/35">No subscribers yet.</p>
          <p className="font-body text-[11px] text-ivory/20 mt-1">Subscribers appear here when customers sign up from the storefront footer.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory/8">
          <table className="w-full min-w-[480px] text-left">
            <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.13em] text-ivory/35">
              <tr>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="font-body divide-y divide-ivory/6 text-sm">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-ivory/3 transition-colors">
                  <td className="px-5 py-3.5 text-ivory">{s.email}</td>
                  <td className="px-5 py-3.5 text-ivory/45">{s.source}</td>
                  <td className="px-5 py-3.5 text-ivory/35">{new Date(s.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
