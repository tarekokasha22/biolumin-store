"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useHydrated } from "@/lib/use-hydrated";

/* Code-built brand wordmark — bright champagne serif with a luminous aqua
   "spark" sitting over each I, echoing the bioluminescence identity. */
function Wordmark() {
  const letters = "BIOLUMIN".split("");
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        direction: "ltr",
        // always the Latin brand serif (Cormorant) — never the locale-swapped
        // Arabic display face, so the wordmark reads as a true logo.
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.34em",
        // start the block slightly past the inset so the first letter sits flush
        paddingInlineStart: "0.34em",
        color: "#efd6a3",
        textShadow:
          "0 0 7px rgba(201,166,107,.4), 0 0 15px rgba(72,214,194,.18)",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >
      {letters.map((ch, i) =>
        ch === "I" ? (
          <span
            key={i}
            style={{
              position: "relative",
              display: "inline-block",
              // strip the trailing letter-spacing from the I's own box so the
              // box width equals just the glyph — keeps the dot centred on the
              // stem (the parent still spaces it from the next letter).
              letterSpacing: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-0.36em",
                left: "50%",
                transform: "translateX(-50%)",
                width: "0.16em",
                height: "0.16em",
                borderRadius: "99px",
                background: "#7ff0e0",
                boxShadow:
                  "0 0 5px 1px rgba(72,214,194,.95), 0 0 11px 2px rgba(72,214,194,.45)",
              }}
            />
            {ch}
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

function HeaderInner() {
  const t        = useTranslations();
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();
  const isAr     = locale === "ar";
  const items    = useCart((s) => s.items);
  const wishItems = useWishlist((s) => s.items);
  const mounted  = useHydrated();

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on navigation
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const switchLocale = () => router.replace(pathname, { locale: isAr ? "en" : "ar" });

  const bagCount = mounted ? items.length : 0;
  const wishCount = mounted ? wishItems.length : 0;

  const NAV_LINKS = [
    { href: "/#drop",    label: t("nav.shop")    },
    { href: "/#story",   label: t("nav.story")   },
    { href: "/#reviews", label: t("nav.reviews") },
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background:   scrolled ? "rgba(14,14,16,.90)" : "rgba(14,14,16,.40)",
        borderBottom: `1px solid ${scrolled ? "rgba(138,129,117,.18)" : "transparent"}`,
        backdropFilter: scrolled ? "blur(14px)" : "blur(6px)",
      }}
    >
      {/* Announcement marquee */}
      <div
        style={{
          background: "linear-gradient(90deg,#161619,#1d1d21,#161619)",
          borderBottom: "1px solid rgba(201,166,107,.14)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            animation: "bl-marquee 18s linear infinite",
            willChange: "transform",
          }}
        >
          {[0, 1].map((rep) => (
            <div key={rep} style={{ display: "flex", flexShrink: 0 }} aria-hidden={rep === 1 ? true : undefined}>
              {[t("nav.announce"), t("nav.announce2"), t("nav.announce"), t("nav.announce2")].map((msg, i) => (
                <span
                  key={i}
                  style={{
                    padding: "5px 20px",
                    fontSize: "9px",
                    letterSpacing: ".26em",
                    textTransform: "uppercase",
                    color: "#c9a66b",
                  }}
                >
                  ✦&nbsp;&nbsp;{msg}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          height: "66px",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Left: logo + links */}
        <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          <Link
            href="/"
            aria-label="BIOLUMIN"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              padding: "4px 2px",
            }}
          >
            <Wordmark />
          </Link>
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "30px" }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "11.5px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "rgba(244,240,233,.72)",
                  textDecoration: "none",
                  transition: "color .3s",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#c9a66b")}
                onMouseOut={(e)  => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(244,240,233,.72)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: lang + bag + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <button
            onClick={switchLocale}
            aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
            style={{
              background: "none",
              border: "1px solid rgba(138,129,117,.4)",
              borderRadius: "99px",
              padding: "6px 13px",
              fontSize: "11px",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "rgba(244,240,233,.8)",
              cursor: "pointer",
              transition: "all .3s",
            }}
          >
            {isAr ? "EN" : "ع"}
          </button>

          <Link
            href="/wishlist"
            aria-label={t("wishlist.nav")}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              color: "rgba(244,240,233,.85)",
              textDecoration: "none",
              transition: "color .3s",
            }}
            onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#c9a66b")}
            onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(244,240,233,.85)")}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  insetInlineEnd: "-8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "15px",
                  minWidth: "15px",
                  padding: "0 4px",
                  borderRadius: "99px",
                  background: "#c9a66b",
                  color: "#0e0e10",
                  fontSize: "9.5px",
                  fontWeight: 600,
                }}
              >
                {wishCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            style={{
              position: "relative",
              fontSize: "11.5px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "rgba(244,240,233,.85)",
              textDecoration: "none",
            }}
          >
            {t("nav.bag")}
            {bagCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "16px",
                  minWidth: "16px",
                  padding: "0 4px",
                  marginInlineStart: "5px",
                  borderRadius: "99px",
                  background: "#c9a66b",
                  color: "#0e0e10",
                  fontSize: "10px",
                  fontWeight: 600,
                  verticalAlign: "middle",
                }}
              >
                {bagCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#f4f0e9",
              padding: "4px",
            }}
            aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 8h16M4 12h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(14,14,16,.97)",
            backdropFilter: "blur(14px)",
            borderTop: "1px solid rgba(138,129,117,.18)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "14px",
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "#f4f0e9",
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

// Both named and default export so existing layout import { Header } keeps working
export function Header() {
  return <HeaderInner />;
}

export default Header;
