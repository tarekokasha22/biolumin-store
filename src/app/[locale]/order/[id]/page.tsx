import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { quoteShipping } from "@/lib/shipping";
import { ProofUpload } from "@/components/order/ProofUpload";

type Props = { params: Promise<{ locale: string; id: string }> };

const STATUS_KEY: Record<string, string> = {
  PENDING: "statusPending",
  CONFIRMED: "statusConfirmed",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  CANCELLED: "statusCancelled",
};

const PAY_LABEL_KEY: Record<string, string> = {
  COD: "cod",
  MANUAL_TRANSFER: "manual",
  PAYMOB: "cardLabel",
};

export default async function OrderPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("order");
  const tc = await getTranslations("checkout");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, proof: true },
  });
  if (!order) notFound();

  const isAr = locale === "ar";
  const wallet =
    process.env.NEXT_PUBLIC_WALLET_NUMBER || process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || "—";
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(t("whatsappTrackMsg", { number: order.id.slice(-8).toUpperCase() }))}`
    : null;
  const eta = quoteShipping(order.governorate, order.subtotal, order.paymentMethod !== "COD");

  return (
    <div className="flex min-h-[74svh] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="relative mb-6 h-24 w-24">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(72,214,194,.5), transparent 65%)",
            animation: "success-bloom 2.4s ease-out infinite",
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-linear-to-br from-aqua to-[#3aa593] shadow-[0_0_40px_rgba(72,214,194,.4)]">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#06201c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>

      <h1 className="font-display mb-3 text-[32px] leading-[1.15] text-white">{t("thanksTitle")}</h1>
      <p className="mb-6 max-w-[330px] font-body text-sm leading-[1.7] text-ivory/70">{t("thanksSub")}</p>

      <div className="mb-4.5 w-full max-w-[360px] rounded-[16px] border border-champagne/18 bg-panel/70 p-4.5">
        <DetailRow label={t("number")} value={`#${order.id.slice(-8).toUpperCase()}`} ltr />
        <DetailRow label={t("paidWith")} value={tc(PAY_LABEL_KEY[order.paymentMethod] ?? "cod")} />
        <DetailRow label={t("eta")} value={t("etaShort", { min: eta.minDays, max: eta.maxDays })} />
        <DetailRow label={t("total")} value={formatPrice(order.total, locale)} last />
      </div>

      {waHref && (
        <div className="mb-5.5 flex w-full max-w-[360px] items-start gap-2.5 rounded-(--radius-button) border border-[rgba(37,211,102,.25)] bg-[rgba(37,211,102,.08)] p-3.5 text-start">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#25d366" className="flex-none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-body text-[12.5px] leading-[1.6] text-ivory/80">{t("whatsappReassurance")}</span>
        </div>
      )}

      <div className="flex w-full max-w-[360px] flex-col gap-2.5">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body flex items-center justify-center gap-2 rounded-(--radius-button) bg-[#25d366] py-[15px] text-sm font-semibold text-[#06210f]"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("trackWhatsapp")}
          </a>
        )}
        <Link href="/shop" className="font-body rounded-(--radius-button) border border-greige/34 py-[15px] text-sm text-ivory">
          {t("continue")}
        </Link>
      </div>

      {order.paymentMethod === "MANUAL_TRANSFER" && (
        <div className="mt-8 w-full max-w-[360px] rounded-[16px] border border-champagne/25 bg-panel/60 p-5 text-start">
          <h2 className="font-display mb-4 text-xl text-ivory">{t("transferTitle")}</h2>
          <ol className="font-body space-y-3.5 text-sm text-ivory/70">
            <li>
              <p>{t("transferStep1", { total: order.total })}</p>
              <p dir="ltr" className="font-display mt-1.5 text-xl tracking-wide text-champagne-bright select-all">{wallet}</p>
            </li>
            <li>{t("transferStep2")}</li>
            <li>{t("transferStep3")}</li>
          </ol>
          <div className="mt-5">
            <p className="font-body mb-3 text-[11px] tracking-[0.2em] text-champagne uppercase">{t("uploadProof")}</p>
            <ProofUpload orderId={order.id} initialUrl={order.proof?.url ?? null} />
          </div>
        </div>
      )}

      <div className="mt-6 w-full max-w-[360px] text-start font-body text-xs text-ivory/45">
        {t("status")}: <span className="text-ivory/70">{t(STATUS_KEY[order.status])}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, ltr, last }: { label: string; value: string; ltr?: boolean; last?: boolean }) {
  return (
    <div className={`flex justify-between py-2 font-body text-[12.5px] ${last ? "" : "border-b border-greige/14"}`}>
      <span className="text-ivory/60">{label}</span>
      <span dir={ltr ? "ltr" : undefined} className={last ? "text-[15px] font-semibold text-white" : "text-ivory"}>
        {value}
      </span>
    </div>
  );
}
