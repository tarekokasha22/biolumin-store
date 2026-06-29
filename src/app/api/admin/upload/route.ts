import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { saveUpload } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return token ? verifyAdminToken(token) : false;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const productId = form.get("productId");
  const file = form.get("file");

  if (typeof productId !== "string" || !(file instanceof File)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return Response.json({ error: "bad_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await saveUpload(bytes, ext, "products", file.type);

  const last = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
  });
  const order = last ? last.order + 1 : 0;

  const image = await prisma.productImage.create({
    data: { productId, url, order },
  });

  return Response.json({ id: image.id, url });
}
