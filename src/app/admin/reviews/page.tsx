import { prisma } from "@/lib/prisma";
import { isAdmin, createReview, toggleReviewFeatured, deleteReview } from "@/lib/admin-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const inputClass =
  "font-body w-full rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-champagne/50 focus:outline-none";
const labelClass = "font-body mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-ivory/35";

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
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ivory">Reviews</h1>
        <span className="font-body rounded-full border border-ivory/8 px-4 py-1.5 text-xs text-ivory/40">
          {reviews.length} total
        </span>
      </div>

      {products.length > 0 && (
        <form action={createReview} className="mb-10 space-y-4 rounded-xl border border-ivory/8 bg-obsidian-soft/40 p-6">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-ivory/35">New Review</p>

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
            <div><label className={labelClass}>Author name (EN)</label><input name="authorNameEn" required placeholder="Mariam Adel" className={inputClass} /></div>
            <div><label className={labelClass}>Author name (AR)</label><input name="authorNameAr" required dir="rtl" placeholder="مريم عادل" className={inputClass} /></div>
            <div><label className={labelClass}>City (EN)</label><input name="authorCityEn" placeholder="Cairo" className={inputClass} /></div>
            <div><label className={labelClass}>City (AR)</label><input name="authorCityAr" dir="rtl" placeholder="القاهرة" className={inputClass} /></div>
            <div><label className={labelClass}>Review (EN)</label><textarea name="bodyEn" required rows={3} placeholder="The fabric is gorgeous…" className={inputClass} /></div>
            <div><label className={labelClass}>Review (AR)</label><textarea name="bodyAr" required rows={3} dir="rtl" placeholder="الخامة تحفة…" className={inputClass} /></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="font-body flex items-center gap-2 text-sm text-ivory/60">
              <input type="checkbox" name="featuredOnHome" value="true" className="h-4 w-4 accent-champagne" />
              Feature on homepage
            </label>
            <button type="submit" className="font-body rounded-full bg-champagne px-8 py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90">
              Add Review
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="font-body text-ivory/40">No reviews yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory/8">
          <table className="w-full min-w-[720px] text-left">
            <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.13em] text-ivory/35">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Review</th>
                <th className="px-5 py-3.5">Home</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body divide-y divide-ivory/6 text-sm">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-ivory/3 transition-colors align-top">
                  <td className="px-5 py-3.5 text-ivory/70">{r.product.nameEn}</td>
                  <td className="px-5 py-3.5 text-ivory">
                    {r.authorNameEn}
                    <span className="block text-[11px] text-ivory/35">{r.authorCityEn}</span>
                  </td>
                  <td className="px-5 py-3.5 text-champagne">{"★".repeat(r.rating)}</td>
                  <td className="max-w-[260px] px-5 py-3.5 text-ivory/55 text-xs leading-relaxed">{r.bodyEn}</td>
                  <td className="px-5 py-3.5">
                    <form action={toggleReviewFeatured}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className={`font-body rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                        r.featuredOnHome
                          ? "border-champagne text-champagne"
                          : "border-ivory/15 text-ivory/35 hover:border-champagne hover:text-champagne"
                      }`}>
                        {r.featuredOnHome ? "Featured" : "Feature"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <form action={deleteReview}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="font-body rounded-full border border-ivory/15 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/35 hover:border-red-300 hover:text-red-300 transition-colors">
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
    </div>
  );
}
