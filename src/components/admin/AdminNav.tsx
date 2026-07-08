"use client";

import { useState } from "react";
import { logoutAction } from "@/lib/admin-actions";

type Tab =
  | "products"
  | "inventory"
  | "orders"
  | "discounts"
  | "drops"
  | "reviews"
  | "subscribers"
  | "business";

const NAV_ITEMS: { href: string; label: string; key: Tab }[] = [
  { href: "/admin/products",    label: "Products",    key: "products"     },
  { href: "/admin/drops",       label: "Drops",       key: "drops"        },
  { href: "/admin/inventory",   label: "Inventory",   key: "inventory"    },
  { href: "/admin/orders",      label: "Orders",      key: "orders"       },
  { href: "/admin/discounts",   label: "Discounts",   key: "discounts"    },
  { href: "/admin/reviews",     label: "Reviews",     key: "reviews"      },
  { href: "/admin/subscribers", label: "Subscribers", key: "subscribers"  },
  { href: "/admin/business",    label: "Business ✦",  key: "business"     },
];

export function AdminNav({ active }: { active: Tab }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-ivory/10 bg-obsidian/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Brand */}
          <a
            href="/admin/inventory"
            className="font-display text-xl text-champagne tracking-widest shrink-0"
          >
            BIOLUMIN
          </a>

          {/* Desktop nav — hidden on small screens */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto max-w-[700px] flex-1 mx-6">
            {NAV_ITEMS.map(({ href, label, key }) => (
              <a
                key={key}
                href={href}
                className={`font-body whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active === key
                    ? "bg-champagne/10 text-champagne"
                    : "text-ivory/50 hover:text-ivory hover:bg-ivory/5"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right side: logout + hamburger */}
          <div className="flex items-center gap-3">
            {/* Logout — always visible */}
            <form action={logoutAction}>
              <button className="font-body hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-ivory/40 transition-colors hover:text-champagne">
                Logout
              </button>
            </form>

            {/* Hamburger — visible on mobile only */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden flex flex-col gap-[5px] p-2 rounded-md text-ivory/60 hover:text-ivory transition-colors"
            >
              <span
                className={`block h-0.5 w-5 bg-current transition-transform duration-300 origin-center ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition-opacity duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition-transform duration-300 origin-center ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ───────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-ivory/10 ${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1 px-4 py-3 bg-obsidian/95">
            {NAV_ITEMS.map(({ href, label, key }) => (
              <a
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                className={`font-body flex items-center gap-3 rounded-lg px-4 py-3 text-[12px] uppercase tracking-[0.2em] transition-colors ${
                  active === key
                    ? "bg-champagne/10 text-champagne border border-champagne/20"
                    : "text-ivory/50 hover:text-ivory hover:bg-ivory/5"
                }`}
              >
                {active === key && (
                  <span className="h-1.5 w-1.5 rounded-full bg-champagne shrink-0" />
                )}
                {label}
              </a>
            ))}

            {/* Logout inside drawer for very small screens */}
            <div className="mt-2 border-t border-ivory/10 pt-3">
              <form action={logoutAction}>
                <button className="font-body w-full rounded-lg px-4 py-3 text-left text-[12px] uppercase tracking-[0.2em] text-ivory/40 hover:text-red-300 transition-colors">
                  Logout
                </button>
              </form>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
