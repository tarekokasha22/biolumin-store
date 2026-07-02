import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAdmin, createReview, toggleReviewFeatured, deleteReview } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const inputClass =
  "font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none";
const labelClass =
  "font-body mb-1 block text-[10px] uppercase tracking-[0.15em] text-ivory/40";

export default async function AdminReviewsPage() {
  if (!(await isAdmin())) redirect("/admin");

  const [products, reviews] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, nameEn: true } }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { nameEn: true } } },
    }),
  ]);

  return (
    <>
      <AdminNav active="reviews" />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl">Reviews</h1>
          <span className="font-body rounded-full border border-ivory/10 px-4 py-1.5 text-xs text-ivory/50">
            {reviews.length} total
          </span>
        </div>

        {products.length === 0 ? (
          <p className="font-body text-ivory/50">Add a product first, then you can attach reviews to it.</p>
        ) : (
          <form
            action={createReview}
            className="mb-10 space-y-4 rounded-sm border border-ivory/10 bg-obsidian-soft/20 p-6"
          >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-ivory/40">New Review</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product</label>
                <select name="productId" required className={`${inputClass} bg-obsidian`}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.nameEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Rating</label>
                <select name="rating" defaultValue="5" className={`${inputClass} bg-obsidian`}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Author name (EN)</label>
                <input name="authorNameEn" required placeholder="Mariam Adel" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Author name (AR)</label>
                <input name="authorNameAr" required dir="rtl" placeholder="مريم عادل" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City (EN)</label>
                <input name="authorCityEn" placeholder="Cairo" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City (AR)</label>
                <input name="authorCityAr" dir="rtl" placeholder="القاهرة" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Review (EN)</label>
                <textarea name="bodyEn" required rows={3} placeholder="The fabric is gorgeous…" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Review (AR)</label>
                <textarea name="bodyAr" required rows={3} dir="rtl" placeholder="الخامة تحفة…" className={inputClass} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <label className="font-body flex items-center gap-2 text-sm text-ivory/70">
                <input type="checkbox" name="featuredOnHome" value="true" className="h-4 w-4 accent-champagne" />
                Feature on homepage
              </label>
              <button
                type="submit"
                className="font-body rounded-full bg-champagne px-8 py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90"
              >
                Add Review
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="font-body text-ivory/50">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-ivory/10">
            <table className="w-full min-w-[720px] text-left">
              <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.15em] text-ivory/40">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Review (EN)</th>
                  <th className="px-4 py-3">Home</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body divide-y divide-ivory/10 text-sm">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-obsidian-soft/20 align-top">
                    <td className="px-4 py-3 text-ivory/80">{r.product.nameEn}</td>
                    <td className="px-4 py-3 text-ivory">
                      {r.authorNameEn}
                      <span className="block text-[11px] text-ivory/40">{r.authorCityEn}</span>
                    </td>
                    <td className="px-4 py-3 text-champagne">{"★".repeat(r.rating)}</td>
                    <td className="max-w-[280px] px-4 py-3 text-ivory/60">{r.bodyEn}</td>
                    <td className="px-4 py-3">
                      <form action={toggleReviewFeatured}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          className={`font-body rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                            r.featuredOnHome
                              ? "border-champagne text-champagne"
                              : "border-ivory/20 text-ivory/40 hover:border-champagne hover:text-champagne"
                          }`}
                        >
                          {r.featuredOnHome ? "Featured" : "Feature"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <form action={deleteReview}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="font-body rounded-full border border-ivory/20 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/40 transition-colors hover:border-red-300 hover:text-red-300">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
