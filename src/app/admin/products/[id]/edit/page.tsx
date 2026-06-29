import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { ImageManager } from "@/components/admin/ImageManager";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { updateProduct, isAdmin } from "@/lib/admin-actions";
import { CATEGORY_LABELS } from "@/lib/categories";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditProductPage({ params, searchParams }: Props) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const { saved } = await searchParams;

  const [product, drops] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.drop.findMany({ orderBy: { number: "desc" } }),
  ]);
  if (!product) notFound();

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <>
      <AdminNav active="products" />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/products" className="font-body text-xs text-ivory/40 hover:text-ivory">
            ← Products
          </Link>
          <h1 className="font-display text-3xl">Edit Product</h1>
          {saved && (
            <span className="font-body rounded-full bg-aqua/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-aqua">
              Saved ✓
            </span>
          )}
        </div>

        {/* Images first */}
        <section className="mb-10 rounded-sm border border-ivory/10 bg-obsidian-soft/20 p-6">
          <ImageManager productId={product.id} images={product.images} />
        </section>

        {/* Details form */}
        <form action={updateProduct} className="space-y-6">
          <input type="hidden" name="id" value={product.id} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name (English)" name="nameEn" defaultValue={product.nameEn} required />
            <Field label="Name (Arabic)" name="nameAr" defaultValue={product.nameAr} required dir="rtl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Description (English)" name="descEn" defaultValue={product.descEn} />
            <Textarea label="Description (Arabic)" name="descAr" defaultValue={product.descAr} dir="rtl" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <NumberField label="Price (EGP)" name="price" defaultValue={product.price} min={1} required />
            <NumberField
              label="Compare-at Price (EGP)"
              name="compareAtPrice"
              defaultValue={product.compareAtPrice ?? undefined}
              min={1}
              hint="Shows crossed-out 'was' price"
            />
            <Field label="Size" name="size" defaultValue={product.size} required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
                Category
              </label>
              <select
                name="category"
                defaultValue={product.category}
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              >
                {categories.map(([slug, { en }]) => (
                  <option key={slug} value={slug}>{en}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
                Tier
              </label>
              <select
                name="tier"
                defaultValue={product.tier}
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              >
                <option value="ENTRY">Entry</option>
                <option value="HERO">Hero</option>
                <option value="ANCHOR">Anchor</option>
              </select>
            </div>

            <div>
              <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
                Status
              </label>
              <select
                name="status"
                defaultValue={product.status}
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>

          {drops.length > 0 && (
            <div>
              <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
                Drop (optional)
              </label>
              <select
                name="dropId"
                defaultValue={product.dropId ?? ""}
                className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
              >
                <option value="">— No drop —</option>
                {drops.map((d) => (
                  <option key={d.id} value={d.id}>
                    Drop #{d.number} — {d.nameEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="font-body w-full rounded-full bg-champagne py-3 text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90"
          >
            Save Changes
          </button>
        </form>

        <div className="mt-12 border-t border-ivory/10 pt-8">
          <p className="font-body mb-4 text-sm text-ivory/40">
            Deleting a product is permanent and cannot be undone.
          </p>
          <DeleteProductButton id={product.id} />
        </div>
      </main>
    </>
  );
}

function Field({
  label, name, defaultValue, placeholder, required, dir,
}: {
  label: string; name: string; defaultValue?: string;
  placeholder?: string; required?: boolean; dir?: string;
}) {
  return (
    <div>
      <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        dir={dir}
        className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
      />
    </div>
  );
}

function NumberField({
  label, name, defaultValue, min, required, hint,
}: {
  label: string; name: string; defaultValue?: number;
  min?: number; required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
        {label}
      </label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        min={min}
        required={required}
        className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
      />
      {hint && <p className="font-body mt-1 text-[10px] text-ivory/25">{hint}</p>}
    </div>
  );
}

function Textarea({
  label, name, defaultValue, dir,
}: {
  label: string; name: string; defaultValue?: string; dir?: string;
}) {
  return (
    <div>
      <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
        {label}
      </label>
      <textarea
        name={name}
        rows={4}
        dir={dir}
        defaultValue={defaultValue}
        className="font-body w-full resize-none rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
      />
    </div>
  );
}
