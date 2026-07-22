"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/admin-actions";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        key: "dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        href: "/admin/products",
        label: "Products",
        key: "products",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        ),
        sub: [{ href: "/admin/products/sorting", label: "Storefront Order", key: "sorting" }],
      },
      {
        href: "/admin/inventory",
        label: "Inventory",
        key: "inventory",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
      {
        href: "/admin/drops",
        label: "Drops",
        key: "drops",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        href: "/admin/orders",
        label: "Orders",
        key: "orders",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        ),
      },
      {
        href: "/admin/discounts",
        label: "Discounts",
        key: "discounts",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
            <line x1="17" y1="8" x2="8" y2="17" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        href: "/admin/reviews",
        label: "Reviews",
        key: "reviews",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        ),
      },
      {
        href: "/admin/subscribers",
        label: "Subscribers",
        key: "subscribers",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Store",
    items: [
      {
        href: "/admin/settings",
        label: "Settings",
        key: "settings",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        ),
      },
      {
        href: "/admin/business",
        label: "Business Hub",
        key: "business",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
          </svg>
        ),
      },
    ],
  },
];

export function AdminSidebar({ pendingOrders = 0 }: { pendingOrders?: number }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === "/admin/dashboard"
      : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand header */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-ivory/8 ${collapsed ? "justify-center px-2" : ""}`}>
        <div className="flex flex-col">
          {!collapsed && (
            <>
              <span className="font-display text-lg tracking-[0.2em] text-champagne leading-none">BIOLUMIN</span>
              <span className="font-body text-[9px] uppercase tracking-[0.4em] text-ivory/30 mt-0.5">Admin Panel</span>
            </>
          )}
          {collapsed && (
            <span className="font-display text-xl tracking-widest text-champagne">B</span>
          )}
        </div>
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto hidden md:flex items-center justify-center w-6 h-6 rounded text-ivory/30 hover:text-ivory transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <p className="font-body px-4 py-1.5 text-[9px] uppercase tracking-[0.35em] text-ivory/25">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <div key={item.key}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                      active
                        ? "bg-champagne/12 text-champagne"
                        : "text-ivory/50 hover:text-ivory hover:bg-ivory/5"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-champagne rounded-full" />
                    )}
                    <span className={`shrink-0 ${active ? "text-champagne" : ""}`}>{item.icon}</span>
                    {!collapsed && (
                      <span className="font-body text-[12px] tracking-[0.05em] flex-1">{item.label}</span>
                    )}
                    {/* Pending badge on orders */}
                    {item.key === "orders" && pendingOrders > 0 && !collapsed && (
                      <span className="font-body ml-auto text-[9px] rounded-full bg-champagne text-obsidian px-2 py-0.5 font-semibold">
                        {pendingOrders}
                      </span>
                    )}
                  </Link>
                  {/* Sub-items */}
                  {!collapsed && item.sub?.map((sub) => (
                    <Link
                      key={sub.key}
                      href={sub.href}
                      className={`flex items-center gap-2 mx-2 ml-8 px-3 py-2 rounded-lg text-[11px] tracking-[0.04em] transition-colors ${
                        pathname.startsWith(sub.href)
                          ? "text-champagne/80"
                          : "text-ivory/35 hover:text-ivory/70"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className={`border-t border-ivory/8 p-3 space-y-1 ${collapsed ? "px-2" : ""}`}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "View Store" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-ivory/40 hover:text-ivory hover:bg-ivory/5 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {!collapsed && <span className="font-body text-[11px] tracking-[0.05em]">View Store</span>}
        </a>

        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-ivory/40 hover:text-red-300 hover:bg-red-300/5 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span className="font-body text-[11px] tracking-[0.05em]">Logout</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-ivory/8 bg-obsidian-soft/95 backdrop-blur-md transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[220px]"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ───────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-ivory/10 bg-obsidian/95 backdrop-blur">
        <span className="font-display text-lg tracking-[0.2em] text-champagne">BIOLUMIN</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col gap-[5px] p-2 text-ivory/60 hover:text-ivory"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-5 bg-current rounded" />
          <span className="block h-0.5 w-5 bg-current rounded" />
          <span className="block h-0.5 w-5 bg-current rounded" />
        </button>
      </header>

      {/* ── Mobile Drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="relative z-10 w-[270px] max-w-[85vw] h-full border-r border-ivory/10 bg-obsidian-soft flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-ivory/10">
              <span className="font-display text-base tracking-[0.2em] text-champagne">BIOLUMIN</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-ivory/60 hover:text-ivory text-sm rounded-lg bg-ivory/5"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
