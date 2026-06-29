import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Newsletter / next-drop waitlist capture. Idempotent: re-subscribing an
// existing email is treated as success, never an error.
const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  source: z.string().trim().max(40).optional(),
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
    return Response.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const { email, source } = parsed.data;
  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email, source: source ?? "footer" },
    });
  } catch {
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
