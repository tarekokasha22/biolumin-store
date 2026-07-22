import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-actions";
import { prisma } from "@/lib/prisma";
import { ProductSortGrid } from "@/components/admin/ProductSortGrid";

export const dynamic = "force-dynamic";

export default async function ProductSortingPage() {
  if (!(await isAdmin())) redirect("/admin");

  let products: {
    id: string;
    nameEn: string;
    nameAr: string;
    category: string;
    status: string;
    sortOrder: number;
    images: { url: string }[];
  }[] = [];

  try {
    products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        category: true,
        status: true,
        sortOrder: true,
        images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
      },
    });
  } catch {
    // Render with empty list on DB error
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/products"
              className="font-body text-xs text-ivory/40 hover:text-ivory transition-colors"
            >
              ← Products
            </Link>
          </div>
          <h1 className="font-display text-3xl text-ivory">Storefront Order</h1>
          <p className="font-body mt-1.5 text-[12px] text-ivory/40">
            Drag to reorder · Items at the top appear first on the online store · Pinned items always show first.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-body">
          <span className="flex items-center gap-1.5 text-ivory/30">
            <span className="h-2 w-2 rounded-full bg-aqua" /> Available
          </span>
          <span className="flex items-center gap-1.5 text-ivory/30">
            <span className="h-2 w-2 rounded-full bg-champagne" /> Reserved
          </span>
          <span className="flex items-center gap-1.5 text-ivory/30">
            <span className="h-2 w-2 rounded-full bg-ivory/20" /> Sold
          </span>
        </div>
      </div>

      {/* Sorting grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-ivory/40 mb-4">No products yet.</p>
          <Link
            href="/admin/products/new"
            className="font-body rounded-full bg-champagne px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-obsidian"
          >
            + Add Product
          </Link>
        </div>
      ) : (
        <ProductSortGrid initialProducts={products} />
      )}
    </div>
  );
}
