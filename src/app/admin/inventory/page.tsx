import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setProductStatus, isAdmin } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "text-aqua",
  RESERVED: "text-champagne",
  SOLD: "text-ivory/40",
};

export default async function AdminInventoryPage() {
  if (!(await isAdmin())) redirect("/admin");
  const products = await prisma.product.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  return (
    <>
      <AdminNav active="inventory" />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display mb-8 text-3xl">Inventory</h1>
        <div className="overflow-x-auto rounded-sm border border-ivory/10">
          <table className="w-full min-w-[560px] text-left">
            <thead className="font-body bg-obsidian-soft/60 text-[11px] uppercase tracking-[0.15em] text-ivory/40">
              <tr>
                <th className="px-4 py-3">Piece</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body divide-y divide-ivory/10 text-sm">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]?.url}
                        alt=""
                        className="h-12 w-10 rounded-sm object-cover"
                      />
                      <div>
                        <p className="text-ivory">{p.nameEn}</p>
                        <p className="text-xs text-ivory/40">{p.nameAr}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ivory/70">
                    {formatPrice(p.price, "en")}
                  </td>
                  <td className={`px-4 py-3 ${STATUS_STYLE[p.status]}`}>
                    {p.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {p.status !== "SOLD" ? (
                        <form action={setProductStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="SOLD" />
                          <button className="rounded-full border border-ivory/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ivory/70 transition-colors hover:border-champagne hover:text-champagne">
                            Mark sold
                          </button>
                        </form>
                      ) : (
                        <form action={setProductStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            type="hidden"
                            name="status"
                            value="AVAILABLE"
                          />
                          <button className="rounded-full border border-ivory/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ivory/70 transition-colors hover:border-aqua hover:text-aqua">
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
      </main>
    </>
  );
}
