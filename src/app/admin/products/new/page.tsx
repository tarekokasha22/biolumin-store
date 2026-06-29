import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { createProduct, isAdmin } from "@/lib/admin-actions";
import { CATEGORY_LABELS } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  if (!(await isAdmin())) redirect("/admin");

  const [categories, drops] = [
    Object.entries(CATEGORY_LABELS),
    await prisma.drop.findMany({ orderBy: { number: "desc" } }),
  ];

  return (
    <>
      <AdminNav active="products" />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/products" className="font-body text-xs text-ivory/40 hover:text-ivory">
            ← Products
          </Link>
          <h1 className="font-display text-3xl">New Product</h1>
        </div>

        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name (English)" name="nameEn" required />
            <Field label="Name (Arabic)" name="nameAr" required dir="rtl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Description (English)" name="descEn" />
            <Textarea label="Description (Arabic)" name="descAr" dir="rtl" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <NumberField label="Price (EGP)" name="price" min={1} required />
            <NumberField
              label="Compare-at Price (EGP)"
              name="compareAtPrice"
              min={1}
              hint="Crossed-out 'was' price"
            />
            <Field label="Size" name="size" placeholder="e.g. S / 38" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
                Category
              </label>
              <select
                name="category"
                required
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
                defaultValue="HERO"
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
                defaultValue="AVAILABLE"
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

          <p className="font-body text-[11px] text-ivory/30">
            After creating the product you can upload its images on the next screen.
          </p>

          <button
            type="submit"
            className="font-body w-full rounded-full bg-champagne py-3 text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90"
          >
            Create Product &amp; Add Images →
          </button>
        </form>
      </main>
    </>
  );
}

function Field({
  label, name, placeholder, required, dir,
}: {
  label: string; name: string; placeholder?: string; required?: boolean; dir?: string;
}) {
  return (
    <div>
      <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
        {label}
      </label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        dir={dir}
        className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
      />
    </div>
  );
}

function NumberField({
  label, name, min, required, hint,
}: {
  label: string; name: string; min?: number; required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
        {label}
      </label>
      <input
        type="number"
        name={name}
        min={min}
        required={required}
        className="font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
      />
      {hint && <p className="font-body mt-1 text-[10px] text-ivory/25">{hint}</p>}
    </div>
  );
}

function Textarea({ label, name, dir }: { label: string; name: string; dir?: string }) {
  return (
    <div>
      <label className="font-body mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ivory/40">
        {label}
      </label>
      <textarea
        name={name}
        rows={4}
        dir={dir}
        className="font-body w-full resize-none rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
      />
    </div>
  );
}
