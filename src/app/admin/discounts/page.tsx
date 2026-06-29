import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAdmin, createDiscount, toggleDiscount, deleteDiscount } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  if (!(await isAdmin())) redirect("/admin");

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminNav active="discounts" />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display mb-8 text-3xl">Discount Codes</h1>

        {/* Create form */}
        <form
          action={createDiscount}
          className="mb-10 rounded-sm border border-ivory/10 bg-obsidian-soft/20 p-6 space-y-4"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-ivory/40">New Code</p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Code
              </label>
              <input
                name="code"
                required
                placeholder="SUMMER20"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm uppercase text-ivory placeholder:normal-case placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Type
              </label>
              <select
                name="type"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian px-3 py-2 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              >
                <option value="PERCENT">Percent %</option>
                <option value="FIXED">Fixed EGP</option>
              </select>
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Value
              </label>
              <input
                type="number"
                name="value"
                required
                min={1}
                placeholder="20"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Min. Subtotal (EGP)
              </label>
              <input
                type="number"
                name="minSubtotal"
                min={0}
                placeholder="0"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Max Uses (blank = unlimited)
              </label>
              <input
                type="number"
                name="maxRedemptions"
                min={1}
                placeholder="∞"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="font-body w-full rounded-full bg-champagne py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90"
              >
                Create Code
              </button>
            </div>
          </div>
        </form>

        {/* Codes list */}
        {codes.length === 0 ? (
          <p className="font-body text-ivory/50">No discount codes yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-ivory/10">
            <table className="w-full min-w-[640px] text-left">
              <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Min. Order</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body divide-y divide-ivory/10 text-sm">
                {codes.map((c) => {
                  const expired = c.expiresAt && c.expiresAt < new Date();
                  const maxedOut = c.maxRedemptions != null && c.timesUsed >= c.maxRedemptions;
                  return (
                    <tr key={c.id} className="hover:bg-obsidian-soft/20">
                      <td className="px-4 py-3 font-mono text-champagne">{c.code}</td>
                      <td className="px-4 py-3 text-ivory/80">
                        {c.type === "PERCENT" ? `${c.value}%` : `${c.value} EGP`}
                      </td>
                      <td className="px-4 py-3 text-ivory/60">
                        {c.minSubtotal > 0 ? `${c.minSubtotal} EGP` : "—"}
                      </td>
                      <td className="px-4 py-3 text-ivory/60">
                        {c.timesUsed}
                        {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                      </td>
                      <td className="px-4 py-3 text-ivory/60">
                        {c.expiresAt
                          ? <span className={expired ? "text-red-300" : ""}>{new Date(c.expiresAt).toLocaleDateString("en-GB")}</span>
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={c.active && !expired && !maxedOut ? "text-aqua" : "text-ivory/30"}>
                          {expired ? "Expired" : maxedOut ? "Used up" : c.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <form action={toggleDiscount}>
                            <input type="hidden" name="id" value={c.id} />
                            <button className="font-body rounded-full border border-ivory/20 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/60 transition-colors hover:border-champagne hover:text-champagne">
                              {c.active ? "Disable" : "Enable"}
                            </button>
                          </form>
                          <form action={deleteDiscount}>
                            <input type="hidden" name="id" value={c.id} />
                            <button className="font-body rounded-full border border-ivory/20 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/40 transition-colors hover:border-red-300 hover:text-red-300">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
