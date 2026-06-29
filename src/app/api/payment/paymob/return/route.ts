import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";

// Where Paymob sends the buyer's *browser* after the hosted iFrame. This is
// purely navigational — it NEVER confirms payment (the HMAC-verified webhook
// does). We just forward them to their order page, which reflects whatever
// status the webhook has already set.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const merchantOrderId = params.get("merchant_order_id");
  const locale = params.get("locale") === "en" ? "en" : "ar";

  if (merchantOrderId) {
    redirect(`/${locale}/order/${merchantOrderId}`);
  }
  // No order reference on the redirect — send them home rather than to a 404.
  redirect(`/${locale}`);
}
