import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-actions";
import { FREE_SHIP_THRESHOLD, COD_FEE, PREPAID_DISCOUNT } from "@/lib/shipping";

export const dynamic = "force-dynamic";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6">
      <h2 className="font-body text-[10px] uppercase tracking-[0.3em] text-ivory/35 mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false, badge }: { label: string; value: string; mono?: boolean; badge?: { text: string; color: string } }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-ivory/6 last:border-0">
      <span className="font-body text-xs text-ivory/50">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`font-body text-[9px] uppercase tracking-[0.1em] rounded-full px-2 py-0.5 ${badge.color}`}>
            {badge.text}
          </span>
        )}
        <span className={`font-body text-xs text-ivory/80 ${mono ? "font-mono" : ""}`}>{value}</span>
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  if (!(await isAdmin())) redirect("/admin");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const instapayHandle = process.env.NEXT_PUBLIC_INSTAPAY_HANDLE ?? "—";
  const walletNumber = process.env.NEXT_PUBLIC_WALLET_NUMBER ?? "—";
  const whatsappPublic = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "—";
  const whatsappOwner = process.env.OWNER_WHATSAPP_NUMBER ?? "—";
  const hasPaymob = !!(process.env.PAYMOB_API_KEY && process.env.PAYMOB_INTEGRATION_ID);
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ivory">Settings</h1>
        <p className="font-body mt-1.5 text-[12px] text-ivory/40">
          Store configuration overview. Edit values via environment variables in your Vercel project.
        </p>
      </div>

      {/* Store Info */}
      <Section title="Store">
        <Row label="Store Name" value="Biolumin" />
        <Row label="Live Site URL" value={siteUrl} mono />
        <Row label="Market" value="Egypt (EGP)" />
        <Row label="Languages" value="Arabic · English" />
      </Section>

      {/* Payment Configuration */}
      <Section title="Payment">
        <Row
          label="Paymob Card Payments"
          value={hasPaymob ? "Configured" : "Not configured"}
          badge={hasPaymob ? { text: "Active", color: "bg-aqua/15 text-aqua" } : { text: "Inactive", color: "bg-ivory/10 text-ivory/40" }}
        />
        <Row
          label="InstaPay Handle"
          value={instapayHandle}
          mono
          badge={{ text: "Active", color: "bg-aqua/15 text-aqua" }}
        />
        <Row label="Mobile Wallet Number" value={walletNumber} mono />
        <Row
          label="Prepaid Discount"
          value={`${Math.round(PREPAID_DISCOUNT * 100)}%`}
          badge={{ text: "Off subtotal", color: "bg-champagne/15 text-champagne" }}
        />
        <Row label="COD Fee" value={COD_FEE > 0 ? `${COD_FEE} EGP` : "No fee"} />
      </Section>

      {/* Shipping Zones */}
      <Section title="Shipping Zones">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-body text-[9px] uppercase tracking-[0.2em] text-ivory/25">
                <th className="pb-2">Zone</th>
                <th className="pb-2">Delivery Fee</th>
                <th className="pb-2">Est. Days</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs divide-y divide-ivory/6">
              {[
                { zone: "Cairo", env: "NEXT_PUBLIC_SHIP_CAIRO", default: 50 },
                { zone: "Delta", env: "NEXT_PUBLIC_SHIP_DELTA", default: 50 },
                { zone: "Canal Zone", env: "NEXT_PUBLIC_SHIP_CANAL", default: 70 },
                { zone: "Upper Egypt", env: "NEXT_PUBLIC_SHIP_UPPER", default: 85 },
                { zone: "Remote Areas", env: "NEXT_PUBLIC_SHIP_REMOTE", default: 110 },
              ].map(({ zone, env, default: def }) => {
                const fee = Number(process.env[env] ?? def);
                return (
                  <tr key={zone} className="hover:bg-ivory/3">
                    <td className="py-2.5 text-ivory/70">{zone}</td>
                    <td className="py-2.5 text-champagne">{fee} EGP</td>
                    <td className="py-2.5 text-ivory/40">2 – 5 days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Row
          label="Free Shipping Threshold"
          value={`${FREE_SHIP_THRESHOLD} EGP`}
          badge={{ text: "Active", color: "bg-aqua/15 text-aqua" }}
        />
        <p className="font-body text-[10px] text-ivory/25 mt-1">
          Orders above this amount get free shipping automatically.
        </p>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row label="Customer WhatsApp" value={whatsappPublic} mono />
        <Row label="Owner WhatsApp" value={whatsappOwner} mono />
        <Row
          label="WhatsApp Notification Webhook"
          value={process.env.WHATSAPP_NOTIFY_URL ? "Configured" : "Not set"}
          badge={process.env.WHATSAPP_NOTIFY_URL
            ? { text: "Active", color: "bg-aqua/15 text-aqua" }
            : { text: "Off", color: "bg-ivory/10 text-ivory/30" }
          }
        />
      </Section>

      {/* Infrastructure */}
      <Section title="Infrastructure">
        <Row
          label="Vercel Blob Storage"
          value={hasBlob ? "Connected" : "Not configured"}
          badge={hasBlob ? { text: "OK", color: "bg-aqua/15 text-aqua" } : { text: "Missing", color: "bg-red-400/15 text-red-300" }}
        />
        <Row label="Database" value="Neon PostgreSQL (Serverless)" badge={{ text: "Active", color: "bg-aqua/15 text-aqua" }} />
        <Row label="Hosting" value="Vercel" badge={{ text: "Live", color: "bg-aqua/15 text-aqua" }} />
      </Section>

      {/* Admin Security */}
      <Section title="Admin Security">
        <Row label="Authentication" value="JWT Cookie (7-day session)" />
        <Row label="Admin Password" value="Set via ADMIN_PASSWORD env var" />
        <Row label="JWT Secret" value="Set via ADMIN_JWT_SECRET env var" />
        <div className="pt-2">
          <p className="font-body text-[10px] text-ivory/25">
            To change your admin password or rotate the JWT secret, update the corresponding environment variable in your Vercel project settings and redeploy.
          </p>
        </div>
      </Section>

      {/* Footer note */}
      <div className="rounded-xl border border-ivory/8 bg-obsidian-soft/40 px-6 py-4">
        <p className="font-body text-[11px] text-ivory/30 leading-relaxed">
          ⚙️ All configuration values are read from <span className="text-ivory/50 font-mono">environment variables</span>.
          To modify them, update your Vercel project settings and trigger a redeploy.
          No restart is needed for most changes — shipping fees and payment handles are injected at build time.
        </p>
      </div>
    </div>
  );
}
