import { prisma } from "@/lib/prisma";
import { isAdmin, createDiscount, toggleDiscount, deleteDiscount } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  if (!(await isAdmin())) redirect("/admin");
  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <h1 className="font-display mb-8 text-3xl text-ivory">Discount Codes</h1>

      {/* Create form */}
      <form action={createDiscount} className="mb-10 rounded-xl border border-ivory/8 bg-obsidian-soft/40 p-6 space-y-4">
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-ivory/35">New Code</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Code", name: "code", placeholder: "SUMMER20", type: "text", extra: "uppercase" },
            { label: "Type", name: "type", type: "select" },
            { label: "Value", name: "value", placeholder: "20", type: "number", min: 1, required: true },
            { label: "Min. Subtotal (EGP)", name: "minSubtotal", placeholder: "0", type: "number", min: 0 },
          ].map((f) =>
            f.type === "select" ? (
              <div key={f.name}>
                <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">{f.label}</label>
                <select name={f.name} className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne/50 focus:outline-none">
                  <option value="PERCENT">Percent %</option>
                  <option value="FIXED">Fixed EGP</option>
                </select>
              </div>
            ) : (
              <div key={f.name}>
                <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">{f.label}</label>
                <input type={f.type} name={f.name} placeholder={f.placeholder} min={f.min} required={f.required}
                  className={`font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-champagne/50 focus:outline-none ${f.extra ?? ""}`} />
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Max Uses (blank = unlimited)</label>
            <input type="number" name="maxRedemptions" min={1} placeholder="∞"
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-champagne/50 focus:outline-none" />
          </div>
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Expires At (optional)</label>
            <input type="datetime-local" name="expiresAt"
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory focus:border-champagne/50 focus:outline-none" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="font-body w-full rounded-full bg-champagne py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90">
              Create Code
            </button>
          </div>
        </div>
      </form>

      {/* Codes list */}
      {codes.length === 0 ? (
        <p className="font-body text-ivory/40">No discount codes yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory/8">
          <table className="w-full min-w-[640px] text-left">
            <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.13em] text-ivory/35">
              <tr>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Discount</th>
                <th className="px-5 py-3.5">Min. Order</th>
                <th className="px-5 py-3.5">Uses</th>
                <th className="px-5 py-3.5">Expires</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body divide-y divide-ivory/6 text-sm">
              {codes.map((c) => {
                const expired = c.expiresAt && c.expiresAt < new Date();
                const maxedOut = c.maxRedemptions != null && c.timesUsed >= c.maxRedemptions;
                return (
                  <tr key={c.id} className="hover:bg-ivory/3 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-champagne">{c.code}</td>
                    <td className="px-5 py-3.5 text-ivory/75">
                      {c.type === "PERCENT" ? `${c.value}%` : `${c.value} EGP`}
                    </td>
                    <td className="px-5 py-3.5 text-ivory/55">{c.minSubtotal > 0 ? `${c.minSubtotal} EGP` : "—"}</td>
                    <td className="px-5 py-3.5 text-ivory/55">
                      {c.timesUsed}{c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-ivory/55">
                      {c.expiresAt ? (
                        <span className={expired ? "text-red-300" : ""}>{new Date(c.expiresAt).toLocaleDateString("en-GB")}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] rounded-full px-2.5 py-1 ${
                        expired ? "bg-red-400/15 text-red-300" :
                        maxedOut ? "bg-ivory/8 text-ivory/35" :
                        c.active ? "bg-aqua/15 text-aqua" : "bg-ivory/8 text-ivory/30"
                      }`}>
                        {expired ? "Expired" : maxedOut ? "Used up" : c.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <form action={toggleDiscount}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="font-body rounded-full border border-ivory/15 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/55 hover:border-champagne hover:text-champagne transition-colors">
                            {c.active ? "Disable" : "Enable"}
                          </button>
                        </form>
                        <form action={deleteDiscount}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="font-body rounded-full border border-ivory/15 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/35 hover:border-red-300 hover:text-red-300 transition-colors">
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
    </div>
  );
}
