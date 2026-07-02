import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Lightweight polling endpoint for the admin order notifier. Returns just the
// counts and the newest order so the client can detect an arrival and chime.
export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const [total, pending, latest] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, customerName: true, total: true, governorate: true },
    }),
  ]);

  return Response.json(
    { total, pending, latest },
    { headers: { "Cache-Control": "no-store" } },
  );
}
