import { z } from "zod";
import { validateDiscount } from "@/lib/discounts";

// Live discount-code check for the checkout UI. Advisory only — the order
// route re-validates and claims the redemption atomically at purchase time.
const schema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation" }, { status: 422 });
  }

  const result = await validateDiscount(parsed.data.code, parsed.data.subtotal);
  if (!result.ok) {
    return Response.json(
      { ok: false, reason: result.reason, minSubtotal: result.minSubtotal },
      { status: 200 },
    );
  }
  return Response.json({
    ok: true,
    code: result.code,
    amount: result.amount,
    type: result.type,
    value: result.value,
  });
}
