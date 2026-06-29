import { logoutAction } from "@/lib/admin-actions";

type Tab = "products" | "inventory" | "orders" | "discounts" | "drops" | "subscribers";

export function AdminNav({ active }: { active: Tab }) {
  const link = (href: string, label: string, key: Tab) => (
    <a
      href={href}
      className={`font-body text-xs uppercase tracking-[0.2em] transition-colors ${
        active === key ? "text-champagne" : "text-ivory/50 hover:text-ivory"
      }`}
    >
      {label}
    </a>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-ivory/10 bg-obsidian/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-xl text-champagne">BIOLUMIN</span>
          <nav className="flex items-center gap-5">
            {link("/admin/products", "Products", "products")}
            {link("/admin/drops", "Drops", "drops")}
            {link("/admin/inventory", "Inventory", "inventory")}
            {link("/admin/orders", "Orders", "orders")}
            {link("/admin/discounts", "Discounts", "discounts")}
            {link("/admin/subscribers", "Subscribers", "subscribers")}
          </nav>
        </div>
        <form action={logoutAction}>
          <button className="font-body text-xs uppercase tracking-[0.2em] text-ivory/50 transition-colors hover:text-champagne">
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
