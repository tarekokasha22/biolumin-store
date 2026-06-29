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
  COD_FEE,
  FREE_SHIP_THRESHOLD,
} from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";

type Method = "cod" | "manual_transfer" | "paymob";
type AppliedCode = { code: string; amount: number };

export function CheckoutForm({ cardEnabled = false }: { cardEnabled?: boolean }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const mounted = useHydrated();
  const [method, setMethod] = useState<Method>("manual_transfer");
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

  // Discount code state
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<AppliedCode | null>(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) {
      router.replace("/cart");
    }
  }, [mounted, items.length, submitting, router]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price, 0),
    [items],
  );

  const prepaid = method === "manual_transfer" || method === "paymob";
  const ship = quoteShipping(form.governorate, subtotal, prepaid);
  const prepaidDiscount = prepaidDiscountAmount(subtotal, prepaid);
  const codeDiscount = applied
    ? Math.min(applied.amount, subtotal - prepaidDiscount)
    : 0;
  const discount = Math.min(prepaidDiscount + codeDiscount, subtotal);
  const codFee = method === "cod" ? COD_FEE : 0;
  const total = subtotal - discount + ship.fee + codFee;
  const toFree = amountToFreeShipping(subtotal);

  if (!mounted || items.length === 0) return null;

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    form.customerName.trim().length >= 2 &&
    form.phone.trim().length >= 8 &&
    form.governorate.trim().length > 0 &&
    form.address.trim().length >= 5;

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
        if (data.reason === "MIN_SUBTOTAL" && data.minSubtotal != null) {
          setCodeError(
            t("discountMin", { amount: formatPrice(data.minSubtotal, locale) }),
          );
        } else {
          setCodeError(t("discountInvalid"));
        }
      }
    } catch {
      setCodeError(t("discountInvalid"));
    } finally {
      setCodeChecking(false);
    }
  }

  function removeCode() {
    setApplied(null);
    setCodeError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!valid) {
      setError(t("required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: method,
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
      if (res.status === 409) {
        setError(t("errorSold"));
      } else {
        setError(t("errorGeneric"));
      }
      setSubmitting(false);
    } catch {
      setError(t("errorGeneric"));
      setSubmitting(false);
    }
  }

  // text-base (16px) on form controls is deliberate: anything smaller makes iOS
  // Safari auto-zoom on focus, which is jarring on mobile (our whole audience).
  const inputCls =
    "font-body w-full rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-4 py-3 text-base text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none";

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <fieldset className="space-y-4">
          <legend className="font-body mb-2 text-[11px] uppercase tracking-[0.3em] text-champagne">
            {t("contactTitle")}
          </legend>
          <input
            className={inputCls}
            placeholder={t("name")}
            value={form.customerName}
            onChange={set("customerName")}
            autoComplete="name"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className={inputCls}
              placeholder={t("phone")}
              value={form.phone}
              onChange={set("phone")}
              inputMode="tel"
              autoComplete="tel"
            />
            <input
              className={inputCls}
              placeholder={t("altPhone")}
              value={form.altPhone}
              onChange={set("altPhone")}
              inputMode="tel"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-body mb-2 text-[11px] uppercase tracking-[0.3em] text-champagne">
            {t("addressTitle")}
          </legend>
          <select
            className={inputCls}
            value={form.governorate}
            onChange={set("governorate")}
          >
            <option value="">{t("governorate")}</option>
            {GOVERNORATES.map((g) => (
              <option key={g.en} value={g.en}>
                {locale === "ar" ? g.ar : g.en}
              </option>
            ))}
          </select>
          {form.governorate && (
            <p className="font-body text-xs text-aqua/80">
              {t("eta", { min: ship.minDays, max: ship.maxDays })}
            </p>
          )}
          <textarea
            className={inputCls}
            placeholder={t("address")}
            rows={3}
            value={form.address}
            onChange={set("address")}
            autoComplete="street-address"
          />
          <textarea
            className={inputCls}
            placeholder={t("notes")}
            rows={2}
            value={form.notes}
            onChange={set("notes")}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-body mb-2 text-[11px] uppercase tracking-[0.3em] text-champagne">
            {t("paymentTitle")}
          </legend>
          <MethodOption
            checked={method === "manual_transfer"}
            onClick={() => setMethod("manual_transfer")}
            title={t("manual")}
            note={
              prepaidDiscount > 0
                ? t("manualDiscount", { amount: prepaidDiscount })
                : t("manualNote")
            }
          />
          {cardEnabled && (
            <MethodOption
              checked={method === "paymob"}
              onClick={() => setMethod("paymob")}
              title={t("card")}
              note={t("cardNote")}
            />
          )}
          <MethodOption
            checked={method === "cod"}
            onClick={() => setMethod("cod")}
            title={t("cod")}
            note={t("codNote")}
          />
        </fieldset>
      </div>

      <aside className="h-fit rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-8">
        <h2 className="font-body mb-6 text-[11px] uppercase tracking-[0.3em] text-champagne">
          {t("summary")}
        </h2>
        <ul className="font-body space-y-3 text-sm text-ivory/70">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span className="line-clamp-1">
                {locale === "ar" ? i.nameAr : i.nameEn}
              </span>
              <span className="shrink-0">{formatPrice(i.price, locale)}</span>
            </li>
          ))}
        </ul>

        {/* Free-shipping progress */}
        <div className="mt-6">
          {ship.freeShipping ? (
            <p className="font-body text-xs text-aqua">
              {t("freeShipUnlocked")}
            </p>
          ) : (
            <>
              <p className="font-body mb-2 text-xs text-ivory/60">
                {t("freeShipProgress", {
                  amount: formatPrice(toFree, locale),
                })}
              </p>
              <FreeShipBar subtotal={subtotal} />
            </>
          )}
        </div>

        {/* Discount code */}
        <div className="mt-6">
          {applied ? (
            <div className="flex items-center justify-between rounded-sm border border-aqua/30 bg-aqua/5 px-4 py-3">
              <span className="font-body text-xs text-aqua">
                {t("discountApplied", { code: applied.code })}
              </span>
              <button
                type="button"
                onClick={removeCode}
                className="font-body text-[11px] uppercase tracking-[0.2em] text-ivory/50 hover:text-ivory"
              >
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
                  className="font-body shrink-0 rounded-sm border border-champagne/50 px-4 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:border-champagne hover:bg-champagne hover:text-obsidian disabled:opacity-50"
                >
                  {codeChecking ? t("applying") : t("apply")}
                </button>
              </div>
              {codeError && (
                <p className="font-body mt-2 text-xs text-red-300">
                  {codeError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rule-gold my-5 h-px w-full" />
        <div className="font-body space-y-2 text-sm text-ivory/70">
          <Row label={t("subtotal")} value={formatPrice(subtotal, locale)} />
          {prepaidDiscount > 0 && (
            <Row
              label={t("manual")}
              value={`− ${formatPrice(prepaidDiscount, locale)}`}
              accent
            />
          )}
          {codeDiscount > 0 && applied && (
            <Row
              label={applied.code}
              value={`− ${formatPrice(codeDiscount, locale)}`}
              accent
            />
          )}
          <Row
            label={t("shipping")}
            value={
              ship.fee === 0 ? t("free") : formatPrice(ship.fee, locale)
            }
            accent={ship.fee === 0}
          />
          {codFee > 0 && (
            <Row label={t("codFee")} value={formatPrice(codFee, locale)} />
          )}
        </div>
        <div className="rule-gold my-5 h-px w-full" />
        <div className="font-body flex justify-between text-base text-ivory">
          <span>{t("total")}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>

        {error && (
          <p className="font-body mt-5 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="font-body mt-6 w-full rounded-full bg-champagne px-9 py-4 text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? t("placing") : t("place")}
        </button>
      </aside>
    </form>
  );
}

function FreeShipBar({ subtotal }: { subtotal: number }) {
  const pct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100),
  );
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-ivory/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-champagne to-aqua transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MethodOption({
  checked,
  onClick,
  title,
  note,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-sm border px-5 py-4 text-start transition-colors ${
        checked
          ? "border-champagne bg-champagne/10"
          : "border-ivory/15 hover:border-ivory/30"
      }`}
    >
      <span className="font-body flex items-center gap-3 text-sm text-ivory">
        <span
          className={`h-3 w-3 shrink-0 rounded-full border ${
            checked ? "border-champagne bg-champagne" : "border-ivory/40"
          }`}
        />
        {title}
      </span>
      <span className="font-body mt-2 block ps-6 text-xs text-ivory/50">
        {note}
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={accent ? "text-aqua" : ""}>{value}</span>
    </div>
  );
}
