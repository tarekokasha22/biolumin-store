import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/catalog";

const schema = z.object({
  productIds: z.array(z.string().min(1)).max(20),
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

  await releaseExpiredReservations();
  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds } },
    select: { id: true, status: true },
  });

  const statuses = Object.fromEntries(products.map((p) => [p.id, p.status]));
  return Response.json({ statuses });
}
