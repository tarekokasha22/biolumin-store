import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
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
    <>
      <AdminNav active="drops" />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display mb-8 text-3xl">Drops</h1>

        {/* Create form */}
        <form
          action={createDrop}
          className="mb-10 rounded-sm border border-ivory/10 bg-obsidian-soft/20 p-6 space-y-4"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-ivory/40">New Drop</p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Drop #
              </label>
              <input
                type="number"
                name="number"
                required
                min={1}
                defaultValue={nextNumber}
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Name (English)
              </label>
              <input
                name="nameEn"
                required
                placeholder="Midnight Bloom"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Name (Arabic)
              </label>
              <input
                name="nameAr"
                required
                dir="rtl"
                placeholder="..."
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                Release Date
              </label>
              <input
                type="datetime-local"
                name="releaseAt"
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="hidden" name="isLive" value="false" />
              <input
                type="checkbox"
                name="isLive"
                value="true"
                className="h-3.5 w-3.5 accent-champagne"
              />
              <span className="font-body text-xs text-ivory/60">Live (visible to customers)</span>
            </label>
            <button
              type="submit"
              className="font-body rounded-full bg-champagne px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90"
            >
              Create Drop
            </button>
          </div>
        </form>

        {/* Drops list */}
        {drops.length === 0 ? (
          <p className="font-body text-ivory/50">No drops yet.</p>
        ) : (
          <div className="space-y-4">
            {drops.map((d) => (
              <article key={d.id} className="rounded-sm border border-ivory/10 bg-obsidian-soft/20 p-5">
                <form action={updateDrop} className="space-y-4">
                  <input type="hidden" name="id" value={d.id} />

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-champagne">#{d.number}</span>
                      <div>
                        <input
                          name="nameEn"
                          defaultValue={d.nameEn}
                          className="font-body rounded-sm border border-transparent bg-transparent px-2 py-1 text-sm text-ivory hover:border-ivory/15 focus:border-champagne/60 focus:outline-none"
                        />
                        <input
                          name="nameAr"
                          defaultValue={d.nameAr}
                          dir="rtl"
                          className="font-body ml-2 rounded-sm border border-transparent bg-transparent px-2 py-1 text-sm text-ivory/60 hover:border-ivory/15 focus:border-champagne/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-body text-xs text-ivory/40">
                        {d._count.products} product{d._count.products !== 1 ? "s" : ""}
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isLive"
                          defaultChecked={d.isLive}
                          className="h-3 w-3 accent-champagne"
                        />
                        <span className="font-body text-[11px] text-ivory/50">Live</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-body mr-2 text-[10px] uppercase tracking-[0.15em] text-ivory/30">
                        Release
                      </label>
                      <input
                        type="datetime-local"
                        name="releaseAt"
                        defaultValue={d.releaseAt.toISOString().slice(0, 16)}
                        className="font-body rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-2 py-1 text-xs text-ivory focus:border-champagne/60 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="font-body rounded-full border border-ivory/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/60 transition-colors hover:border-champagne hover:text-champagne"
                      >
                        Save
                      </button>
                      <form action={deleteDrop}>
                        <input type="hidden" name="id" value={d.id} />
                        <button
                          type="submit"
                          className="font-body rounded-full border border-ivory/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/40 transition-colors hover:border-red-300 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
