import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ProofUpload } from "@/components/order/ProofUpload";

type Props = { params: Promise<{ locale: string; id: string }> };

// Private per-order confirmation — must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const STATUS_KEY: Record<string, string> = {
  PENDING: "statusPending",
  CONFIRMED: "statusConfirmed",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  CANCELLED: "statusCancelled",
};

export default async function OrderPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("order");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, proof: true },
  });
  if (!order) notFound();

  const isAr = locale === "ar";
  const instapay = process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || "";
  const wallet = process.env.NEXT_PUBLIC_WALLET_NUMBER || "";
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const shortId = order.id.slice(-8).toUpperCase();
  const waNotifyHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        t("notifyMessage", { id: shortId }),
      )}`
    : "";

  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="font-display text-4xl text-ivory sm:text-5xl">
            {t("thanksTitle")}
          </h1>
          <p className="font-body mt-4 text-sm text-ivory/60">
            {t("thanksSub")}
          </p>
        </div>

        <div className="mt-12 rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-8">
          <div className="font-body flex justify-between text-sm">
            <span className="text-ivory/50">{t("number")}</span>
            <span className="text-ivory">#{order.id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="font-body mt-3 flex justify-between text-sm">
            <span className="text-ivory/50">{t("status")}</span>
            <span className="text-champagne">
              {t(STATUS_KEY[order.status])}
            </span>
          </div>
          {order.status === "PENDING" && (
            <p className="font-body mt-3 text-xs leading-relaxed text-ivory/45">
              {t("statusPendingHelp")}
            </p>
          )}

          <div className="rule-gold my-6 h-px w-full" />

          <ul className="font-body space-y-3 text-sm text-ivory/70">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span>{isAr ? it.nameAr : it.nameEn}</span>
                <span>{formatPrice(it.priceAtPurchase, locale)}</span>
              </li>
            ))}
          </ul>

          <div className="rule-gold my-6 h-px w-full" />
          <div className="font-body flex justify-between text-base text-ivory">
            <span>{t("total")}</span>
            <span>{formatPrice(order.total, locale)}</span>
          </div>
        </div>

        {order.paymentMethod === "MANUAL_TRANSFER" && (
          <div className="mt-10 rounded-sm border border-champagne/30 bg-obsidian-soft/40 p-8">
            <h2 className="font-display text-2xl text-ivory">
              {t("transferTitle")}
            </h2>
            <ol className="font-body mt-6 space-y-5 text-sm text-ivory/70">
              <li>
                <p>{t("transferStep1", { total: order.total })}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {instapay && (
                    <div className="rounded-sm border border-champagne/20 bg-obsidian/40 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-ivory/45">
                        {t("instapayLabel")}
                      </p>
                      <p className="font-display mt-1 select-all text-xl tracking-wide text-champagne">
                        {instapay}
                      </p>
                    </div>
                  )}
                  {wallet && (
                    <div className="rounded-sm border border-champagne/20 bg-obsidian/40 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-ivory/45">
                        {t("walletLabel")}
                      </p>
                      <p className="font-display mt-1 select-all text-xl tracking-wide text-champagne">
                        {wallet}
                      </p>
                    </div>
                  )}
                </div>
              </li>
              <li>{t("transferStep2")}</li>
              <li>{t("transferStep3")}</li>
            </ol>
            <div className="mt-8">
              <p className="font-body mb-4 text-[11px] uppercase tracking-[0.3em] text-champagne">
                {t("uploadProof")}
              </p>
              <ProofUpload
                orderId={order.id}
                initialUrl={order.proof?.url ?? null}
              />
            </div>
          </div>
        )}

        {order.paymentMethod === "COD" && (
          <div className="mt-10 rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-8">
            <h2 className="font-display text-2xl text-ivory">{t("codTitle")}</h2>
            <p className="font-body mt-4 text-sm text-ivory/70">
              {t("codNote", { total: order.total })}
            </p>
          </div>
        )}

        {order.paymentMethod === "PAYMOB" && (
          <div className="mt-10 rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-8">
            <h2 className="font-display text-2xl text-ivory">{t("cardTitle")}</h2>
            <p className="font-body mt-4 text-sm text-ivory/70">
              {order.status === "PENDING"
                ? t("cardPendingNote")
                : t("cardPaidNote")}
            </p>
          </div>
        )}

        {waNotifyHref && order.status !== "CANCELLED" && (
          <div className="mt-10 rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-7 text-center">
            <h2 className="font-display text-xl text-ivory">
              {t("notifyTitle")}
            </h2>
            <p className="font-body mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ivory/60">
              {t("notifyBody")}
            </p>
            <a
              href={waNotifyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body mt-5 inline-flex items-center gap-2.5 rounded-full border border-champagne/50 px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z" />
              </svg>
              {t("notifyCta")}
            </a>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="font-body rounded-full border border-champagne/50 px-9 py-4 text-xs uppercase tracking-[0.25em] text-ivory transition-all hover:bg-champagne hover:text-obsidian"
          >
            {t("continue")}
          </Link>
        </div>
      </div>
    </main>
  );
}
