"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import {
  quoteShipping,
  amountToFreeShipping,
  prepaidDiscountAmount,
  FREE_SHIP_THRESHOLD,
  COD_FEE,
} from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";

type UIMethod = "instapay" | "card" | "wallet" | "cod";
type Wallet = "vodafone" | "orange" | "etisalat" | "we";
type AppliedCode = { code: string; amount: number };

const WALLETS: { key: Wallet; label: string }[] = [
  { key: "vodafone", label: "Vodafone Cash" },
  { key: "orange", label: "Orange Money" },
  { key: "etisalat", label: "Etisalat Cash" },
  { key: "we", label: "WE Pay" },
];

export function CheckoutForm({ cardEnabled }: { cardEnabled: boolean }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const mounted = useHydrated();
  const [uiMethod, setUiMethod] = useState<UIMethod>("instapay");
  const [wallet, setWallet] = useState<Wallet>("vodafone");
  const [walletPhone, setWalletPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    altPhone: "",
    governorate: "",
    address: "",
    notes: "",
  });

  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<AppliedCode | null>(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) router.replace("/cart");
  }, [mounted, items.length, submitting, router]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);

  const prepaid = uiMethod !== "cod";
  const ship = quoteShipping(form.governorate, subtotal, prepaid);
  const prepaidDiscount = prepaidDiscountAmount(subtotal, prepaid);
  const codeDiscount = applied ? Math.min(applied.amount, subtotal - prepaidDiscount) : 0;
  const discount = Math.min(prepaidDiscount + codeDiscount, subtotal);
  const codFee = uiMethod === "cod" ? COD_FEE : 0;
  const total = subtotal - discount + ship.fee + codFee;
  const toFree = amountToFreeShipping(subtotal);
  const shipPct = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));

  const instapayHandle = process.env.NEXT_PUBLIC_INSTAPAY_HANDLE ?? "";
  const walletNumber = process.env.NEXT_PUBLIC_WALLET_NUMBER ?? "";

  if (!mounted || items.length === 0) return null;

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    form.customerName.trim().length >= 2 &&
    form.phone.trim().length >= 8 &&
    form.governorate.trim().length > 0 &&
    form.address.trim().length >= 5;

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function applyCode() {
    const code = codeInput.trim();
    if (!code) return;
    setCodeChecking(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplied({ code: data.code, amount: data.amount });
        setCodeInput("");
      } else {
        setApplied(null);
        setCodeError(
          data.reason === "MIN_SUBTOTAL" && data.minSubtotal != null
            ? t("discountMin", { amount: formatPrice(data.minSubtotal, locale) })
            : t("discountInvalid"),
        );
      }
    } catch {
      setCodeError(t("discountInvalid"));
    } finally {
      setCodeChecking(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!valid) {
      setError(t("required"));
      return;
    }
    setSubmitting(true);

    const wireMethod = uiMethod === "card" ? "paymob" : uiMethod === "cod" ? "cod" : "manual_transfer";
    const subMethodTag =
      uiMethod === "instapay"
        ? "[InstaPay] "
        : uiMethod === "wallet"
          ? `[Wallet:${wallet}${walletPhone ? " " + walletPhone : ""}] `
          : "";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          notes: subMethodTag + form.notes,
          paymentMethod: wireMethod,
          discountCode: applied?.code ?? "",
          productIds: items.map((i) => i.productId),
        }),
      });
      if (res.ok) {
        const { orderId, redirectUrl } = await res.json();
        clear();
        // Card orders go to Paymob's hosted iFrame; everything else lands on
        // the order confirmation page. window.location for the external host.
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        router.push(`/order/${orderId}`);
        return;
      }
      setError(res.status === 409 ? t("errorSold") : t("errorGeneric"));
      setSubmitting(false);
    } catch {
      setError(t("errorGeneric"));
      setSubmitting(false);
    }
  }

  const inputCls =
    "font-body w-full rounded-(--radius-input) border border-greige/26 bg-panel/60 px-[15px] py-3.5 text-sm text-ivory placeholder:text-ivory/30 outline-none";

  return (
    <form onSubmit={submit}>
      {/* Contact */}
      <fieldset className="mb-4.5">
        <legend className="font-body mb-3 text-[11px] tracking-[0.16em] text-champagne uppercase">
          {t("contactTitle")}
        </legend>
        <div className="flex flex-col gap-2.5">
          <input className={inputCls} placeholder={t("name")} value={form.customerName} onChange={set("customerName")} autoComplete="name" />
          <input className={inputCls} placeholder={t("phone")} value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
        </div>
      </fieldset>

      {/* Shipping */}
      <fieldset className="mb-4.5">
        <legend className="font-body mb-3 text-[11px] tracking-[0.16em] text-champagne uppercase">
          {t("addressTitle")}
        </legend>
        <div className="flex flex-col gap-2.5">
          <textarea className={inputCls} placeholder={t("address")} rows={2} value={form.address} onChange={set("address")} autoComplete="street-address" />
          <select className={inputCls} value={form.governorate} onChange={set("governorate")}>
            <option value="">{t("governorate")}</option>
            {GOVERNORATES.map((g) => (
              <option key={g.en} value={g.en}>
                {locale === "ar" ? g.ar : g.en}
              </option>
            ))}
          </select>
          {form.governorate && (
            <p className="font-body text-xs text-aqua-light">{t("eta", { min: ship.minDays, max: ship.maxDays })}</p>
          )}
          <textarea className={inputCls} placeholder={t("notes")} rows={2} value={form.notes} onChange={set("notes")} />
        </div>
      </fieldset>

      {/* Payment */}
      <fieldset className="mb-4">
        <legend className="font-body mb-3 text-[11px] tracking-[0.16em] text-champagne uppercase">
          {t("paymentTitle")}
        </legend>
        <div className="flex flex-col gap-2.5">
          <MethodRow
            active={uiMethod === "instapay"}
            onClick={() => setUiMethod("instapay")}
            title={t("instapayLabel")}
            note={t("instapayNote")}
            tag={t("instapayTag")}
          />
          {cardEnabled && (
            <MethodRow
              active={uiMethod === "card"}
              onClick={() => setUiMethod("card")}
              title={t("cardLabel")}
              note={t("cardNote")}
            />
          )}
          <MethodRow
            active={uiMethod === "wallet"}
            onClick={() => setUiMethod("wallet")}
            title={t("walletLabel")}
            note={t("walletNote")}
          />
          <MethodRow active={uiMethod === "cod"} onClick={() => setUiMethod("cod")} title={t("cod")} note={t("codNote")} />
        </div>

        {uiMethod === "instapay" && (
          <div className="mt-2.5 rounded-(--radius-button) border border-aqua/20 bg-aqua/6 p-4">
            <p className="font-body mb-3 text-[12.5px] leading-[1.65] text-ivory/74">{t("instapayInfo")}</p>
            <div className="flex items-center justify-between gap-2.5 rounded-(--radius-input) border border-greige/22 bg-[rgba(10,10,12,.5)] px-3.5 py-3">
              <span dir="ltr" className="font-semibold text-white">{instapayHandle || "—"}</span>
              <button type="button" onClick={() => copy(instapayHandle)} className="rounded-lg bg-aqua px-3.5 py-1.5 font-body text-xs font-semibold text-[#06201c]">
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
        )}

        {uiMethod === "card" && cardEnabled && (
          <div className="mt-2.5 rounded-(--radius-button) border border-greige/22 bg-panel/50 p-4">
            <div className="mb-2.5 flex items-center gap-1.5">
              <span className="font-body text-[10.5px] text-ivory/55">{t("acceptedCards")}</span>
              <span className="font-body text-[11px] tracking-[0.04em] text-champagne-bright">VISA · Mastercard · Meeza</span>
            </div>
            <p className="font-body text-[12.5px] leading-[1.65] text-ivory/74">{t("cardRedirectNote")}</p>
          </div>
        )}

        {uiMethod === "wallet" && (
          <div className="mt-2.5 rounded-(--radius-button) border border-greige/22 bg-panel/50 p-4">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {WALLETS.map((w) => (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => setWallet(w.key)}
                  className={`rounded-lg border px-3.5 py-2 font-body text-[11.5px] ${
                    wallet === w.key ? "border-aqua bg-aqua/10 text-aqua-light" : "border-greige/30 text-ivory/60"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <div className="mb-2.5 flex items-center justify-between gap-2.5 rounded-(--radius-input) border border-greige/22 bg-[rgba(10,10,12,.5)] px-3.5 py-3">
              <span dir="ltr" className="font-semibold text-white">{walletNumber || "—"}</span>
              <button type="button" onClick={() => copy(walletNumber)} className="rounded-lg bg-aqua px-3.5 py-1.5 font-body text-xs font-semibold text-[#06201c]">
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <input
              className={inputCls}
              placeholder={t("walletPhonePlaceholder")}
              value={walletPhone}
              onChange={(e) => setWalletPhone(e.target.value)}
              inputMode="tel"
              dir="ltr"
            />
          </div>
        )}

        {uiMethod === "cod" && (
          <div className="mt-2.5 rounded-(--radius-button) border border-champagne/20 bg-champagne/7 p-4">
            <p className="font-body text-[12.5px] leading-[1.65] text-ivory/74">{t("codNote")}</p>
          </div>
        )}
      </fieldset>

      {/* Summary */}
      <div className="mb-4 rounded-[14px] border border-greige/16 bg-panel/60 p-4">
        <div className="font-body mb-3 text-[11px] tracking-[0.16em] text-champagne uppercase">{t("summary")}</div>
        <ul className="font-body mb-2.5 space-y-2 text-[13px] text-ivory/80">
          {items.map((i, idx) => (
            <li key={`${i.productId}-${idx}`} className="flex justify-between gap-3">
              <span className="line-clamp-1">{locale === "ar" ? i.nameAr : i.nameEn}</span>
              <span className="flex-none">{formatPrice(i.price, locale)}</span>
            </li>
          ))}
        </ul>

        {!ship.freeShipping && (
          <div className="mb-3">
            <p className="font-body mb-1.5 text-xs text-ivory/60">{t("freeShipProgress", { amount: formatPrice(toFree, locale) })}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-greige/22">
              <div className="h-full rounded-full bg-linear-to-r from-champagne to-aqua" style={{ width: `${shipPct}%` }} />
            </div>
          </div>
        )}

        <div className="mb-3">
          {applied ? (
            <div className="flex items-center justify-between rounded-(--radius-input) border border-aqua/30 bg-aqua/6 px-3.5 py-2.5">
              <span className="font-body text-xs text-aqua-light">{t("discountApplied", { code: applied.code })}</span>
              <button type="button" onClick={() => setApplied(null)} className="font-body text-[11px] text-ivory/50 uppercase">
                {t("removeCode")}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder={t("discountPlaceholder")}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCode();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={applyCode}
                  disabled={codeChecking || !codeInput.trim()}
                  className="font-body flex-none rounded-(--radius-input) border border-champagne/50 px-4 text-xs text-ivory disabled:opacity-50"
                >
                  {codeChecking ? t("applying") : t("apply")}
                </button>
              </div>
              {codeError && <p className="font-body mt-1.5 text-xs text-red-300">{codeError}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-greige/16 pt-2.5 font-body text-[13px] text-ivory/70">
          <Row label={t("subtotal")} value={formatPrice(subtotal, locale)} />
          {prepaidDiscount > 0 && <Row label={t("prepaidDiscount")} value={`− ${formatPrice(prepaidDiscount, locale)}`} accent />}
          {codeDiscount > 0 && applied && <Row label={applied.code} value={`− ${formatPrice(codeDiscount, locale)}`} accent />}
          <Row label={t("shipping")} value={ship.fee === 0 ? t("free") : formatPrice(ship.fee, locale)} accent={ship.fee === 0} />
          {codFee > 0 && <Row label={t("codFee")} value={formatPrice(codFee, locale)} />}
          <div className="mt-0.5 flex justify-between text-[17px] font-semibold text-white">
            <span>{t("total")}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] text-ivory/50">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#48d6c2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        {t("secureNote")}
      </div>

      {error && <p className="font-body mb-2 text-center text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="font-body w-full rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne py-[17px] text-[15px] font-bold text-[#1a160d] shadow-[0_10px_30px_-10px_rgba(201,166,107,.55)] disabled:opacity-60"
      >
        {submitting ? t("placing") : `${t("place")} · ${formatPrice(total, locale)}`}
      </button>
    </form>
  );
}

function MethodRow({
  active,
  onClick,
  title,
  note,
  tag,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  note: string;
  tag?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-(--radius-button) border px-3.5 py-3.5 text-start ${
        active ? "border-aqua/50 bg-aqua/6" : "border-greige/25 bg-panel/40"
      }`}
    >
      <span className={`flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full border-2 ${active ? "border-aqua" : "border-greige/50"}`}>
        {active && <span className="h-[9px] w-[9px] rounded-full bg-aqua" />}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-medium text-ivory">{title}</span>
          {tag && <span className="rounded-(--radius-pill) bg-aqua/16 px-1.5 py-0.5 font-body text-[9px] text-aqua-light">{tag}</span>}
        </div>
        <div className="font-body mt-0.5 text-[11.5px] text-ivory/55">{note}</div>
      </div>
    </button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={accent ? "text-aqua-light" : ""}>{value}</span>
    </div>
  );
}
