import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setProductStatus, isAdmin } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "text-aqua",
  RESERVED: "text-champagne",
  SOLD: "text-ivory/40",
};

export default async function AdminInventoryPage() {
  if (!(await isAdmin())) redirect("/admin");
  const products = await prisma.product.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "desc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  const available = products.filter((p) => p.status === "AVAILABLE").length;
  const reserved = products.filter((p) => p.status === "RESERVED").length;
  const sold = products.filter((p) => p.status === "SOLD").length;

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ivory">Inventory</h1>
        <div className="flex items-center gap-4 font-body text-[11px] text-ivory/40">
          <span><span className="text-aqua font-semibold">{available}</span> available</span>
          <span><span className="text-champagne font-semibold">{reserved}</span> reserved</span>
          <span><span className="text-ivory/30 font-semibold">{sold}</span> sold</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ivory/8">
        <table className="w-full min-w-[560px] text-left">
          <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.15em] text-ivory/35">
            <tr>
              <th className="px-5 py-3.5">Piece</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="font-body divide-y divide-ivory/6 text-sm">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-ivory/3 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-12 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-10 rounded-lg bg-obsidian-raised" />
                    )}
                    <div>
                      <p className="text-ivory">{p.nameEn}</p>
                      <p className="text-xs text-ivory/35">{p.nameAr}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ivory/70">{formatPrice(p.price, "en")}</td>
                <td className={`px-5 py-3.5 font-semibold text-[12px] ${STATUS_STYLE[p.status]}`}>
                  {p.status}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    {p.status !== "SOLD" ? (
                      <form action={setProductStatus}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status" value="SOLD" />
                        <button className="rounded-full border border-ivory/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ivory/60 transition-colors hover:border-champagne hover:text-champagne">
                          Mark sold
                        </button>
                      </form>
                    ) : (
                      <form action={setProductStatus}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status" value="AVAILABLE" />
                        <button className="rounded-full border border-ivory/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ivory/60 transition-colors hover:border-aqua hover:text-aqua">
                          Make available
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
