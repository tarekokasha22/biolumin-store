import { prisma } from "@/lib/prisma";
import { isAdmin, createDrop, updateDrop, deleteDrop } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDropsPage() {
  if (!(await isAdmin())) redirect("/admin");

  const drops = await prisma.drop.findMany({
    orderBy: { number: "desc" },
    include: { _count: { select: { products: true } } },
  });

  const nextNumber = drops.length > 0 ? drops[0].number + 1 : 1;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <h1 className="font-display mb-8 text-3xl text-ivory">Drops</h1>

      {/* Create form */}
      <form action={createDrop} className="mb-10 rounded-xl border border-ivory/8 bg-obsidian-soft/40 p-6 space-y-4">
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-ivory/35">New Drop</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Drop #</label>
            <input type="number" name="number" required min={1} defaultValue={nextNumber}
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory focus:border-champagne/50 focus:outline-none" />
          </div>
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Name (English)</label>
            <input name="nameEn" required placeholder="Midnight Bloom"
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-champagne/50 focus:outline-none" />
          </div>
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Name (Arabic)</label>
            <input name="nameAr" required dir="rtl" placeholder="..."
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-champagne/50 focus:outline-none" />
          </div>
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Release Date</label>
            <input type="datetime-local" name="releaseAt"
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory focus:border-champagne/50 focus:outline-none" />
          </div>
          <div>
            <label className="font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35">Countdown Ends</label>
            <input type="datetime-local" name="closesAt"
              className="font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory focus:border-champagne/50 focus:outline-none" />
            <p className="font-body mt-1 text-[9px] text-ivory/25">Drives the homepage clock. Leave empty for no timer.</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="isLive" value="false" />
            <input type="checkbox" name="isLive" value="true" className="h-3.5 w-3.5 accent-champagne" />
            <span className="font-body text-xs text-ivory/55">Live (visible to customers)</span>
          </label>
          <button type="submit" className="font-body rounded-full bg-champagne px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90">
            Create Drop
          </button>
        </div>
      </form>

      {/* Drops list */}
      {drops.length === 0 ? (
        <p className="font-body text-ivory/40">No drops yet.</p>
      ) : (
        <div className="space-y-4">
          {drops.map((d) => (
            <article key={d.id} className="rounded-xl border border-ivory/8 bg-obsidian-soft/40 p-5">
              <form action={updateDrop} className="space-y-4">
                <input type="hidden" name="id" value={d.id} />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-champagne">#{d.number}</span>
                    <div>
                      <input name="nameEn" defaultValue={d.nameEn}
                        className="font-body rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-ivory hover:border-ivory/12 focus:border-champagne/50 focus:outline-none" />
                      <input name="nameAr" defaultValue={d.nameAr} dir="rtl"
                        className="font-body ml-2 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-ivory/55 hover:border-ivory/12 focus:border-champagne/50 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-ivory/35">
                      {d._count.products} product{d._count.products !== 1 ? "s" : ""}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" name="isLive" defaultChecked={d.isLive} className="h-3 w-3 accent-champagne" />
                      <span className="font-body text-[11px] text-ivory/45">{d.isLive ? "Live" : "Draft"}</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/25">Release</label>
                      <input type="datetime-local" name="releaseAt" defaultValue={d.releaseAt.toISOString().slice(0, 16)}
                        className="font-body rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-2.5 py-1.5 text-xs text-ivory focus:border-champagne/50 focus:outline-none" />
                    </div>
                    <div>
                      <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/25">Countdown Ends</label>
                      <input type="datetime-local" name="closesAt" defaultValue={d.closesAt ? d.closesAt.toISOString().slice(0, 16) : ""}
                        className="font-body rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-2.5 py-1.5 text-xs text-ivory focus:border-champagne/50 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="font-body rounded-full border border-ivory/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/55 hover:border-champagne hover:text-champagne transition-colors">
                      Save
                    </button>
                    <button type="submit" formAction={deleteDrop} className="font-body rounded-full border border-ivory/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/35 hover:border-red-300 hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
