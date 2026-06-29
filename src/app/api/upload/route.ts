import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/storage";

// Keep under Vercel's ~4.5MB serverless request-body limit so oversized uploads
// fail cleanly with a 413 instead of hanging at the platform edge.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const form = await request.formData();
  const orderId = form.get("orderId");
  const file = form.get("file");

  if (typeof orderId !== "string" || !(file instanceof File)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return Response.json({ error: "bad_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await saveUpload(bytes, ext, "", file.type);

  await prisma.paymentProof.upsert({
    where: { orderId },
    create: { orderId, url, approved: false },
    update: { url, approved: false, uploadedAt: new Date() },
  });

  return Response.json({ url });
}
