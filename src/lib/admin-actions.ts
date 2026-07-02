"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  createAdminToken,
  verifyAdminToken,
} from "@/lib/admin-auth";

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return token ? verifyAdminToken(token) : false;
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) redirect("/admin?error=1");
  const token = await createAdminToken();
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin/products");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

// ── Orders ──────────────────────────────────────────────────────────────────

export async function setProductStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["AVAILABLE", "RESERVED", "SOLD"].includes(status)) return;
  await prisma.product.update({
    where: { id },
    data: { status: status as "AVAILABLE" | "RESERVED" | "SOLD", reservedUntil: null },
  });
  revalidatePath("/admin/inventory");
}

const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function advanceOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;
  const next = NEXT_STATUS[order.status];
  if (!next) return;
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: next as "CONFIRMED" | "SHIPPED" | "DELIVERED" },
    });
    // Confirming an order turns the 30-minute checkout hold into a permanent
    // reservation (clear the expiry so the sweeper can't release it). We do
    // NOT mark the piece SOLD here — the owner flips it to SOLD by hand from
    // the inventory page once the piece has actually shipped/changed hands.
    if (next === "CONFIRMED") {
      await tx.product.updateMany({
        where: {
          id: { in: order.items.map((i) => i.productId) },
          status: "RESERVED",
        },
        data: { reservedUntil: null },
      });
    }
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });
    await tx.product.updateMany({
      where: { id: { in: order.items.map((i) => i.productId) }, status: "RESERVED" },
      data: { status: "AVAILABLE", reservedUntil: null },
    });
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
}

export async function approveProof(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  await prisma.paymentProof.update({ where: { orderId }, data: { approved: true } });
  revalidatePath("/admin/orders");
}

// ── Products ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseOptionalInt(v: FormDataEntryValue | null): number | null {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const descEn = String(formData.get("descEn") ?? "").trim();
  const descAr = String(formData.get("descAr") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? "0"), 10);
  const compareAtPrice = parseOptionalInt(formData.get("compareAtPrice"));
  const tier = String(formData.get("tier") ?? "HERO") as "ENTRY" | "HERO" | "ANCHOR";
  const category = String(formData.get("category") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const status = String(formData.get("status") ?? "AVAILABLE") as "AVAILABLE" | "RESERVED" | "SOLD";
  const dropId = String(formData.get("dropId") ?? "").trim() || null;

  if (!nameEn || !nameAr || !category || !size || price <= 0) return;

  let slug = slugify(nameEn);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const product = await prisma.product.create({
    data: { slug, nameEn, nameAr, descEn, descAr, price, compareAtPrice, tier, category, size, status, dropId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const descEn = String(formData.get("descEn") ?? "").trim();
  const descAr = String(formData.get("descAr") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? "0"), 10);
  const compareAtPrice = parseOptionalInt(formData.get("compareAtPrice"));
  const tier = String(formData.get("tier") ?? "HERO") as "ENTRY" | "HERO" | "ANCHOR";
  const category = String(formData.get("category") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const status = String(formData.get("status") ?? "AVAILABLE") as "AVAILABLE" | "RESERVED" | "SOLD";
  const dropId = String(formData.get("dropId") ?? "").trim() || null;

  if (!id || !nameEn || !nameAr || !category || !size || price <= 0) return;

  await prisma.product.update({
    where: { id },
    data: { nameEn, nameAr, descEn, descAr, price, compareAtPrice, tier, category, size, status, dropId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  redirect(`/admin/products/${id}/edit?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  redirect("/admin/products");
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await prisma.productImage.delete({ where: { id } });
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  });
  for (let i = 0; i < images.length; i++) {
    await prisma.productImage.update({ where: { id: images[i].id }, data: { order: i } });
  }
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function reorderImages(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const ids = String(formData.get("ids")).split(",").filter(Boolean);
  await prisma.$transaction(
    ids.map((id, i) => prisma.productImage.update({ where: { id }, data: { order: i } })),
  );
  revalidatePath(`/admin/products/${productId}/edit`);
}

// ── Drops ───────────────────────────────────────────────────────────────────

export async function createDrop(formData: FormData) {
  await requireAdmin();
  const number = parseInt(String(formData.get("number") ?? "0"), 10);
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const releaseAt = String(formData.get("releaseAt") ?? "").trim();
  const closesAt = String(formData.get("closesAt") ?? "").trim();
  const isLive = formData.get("isLive") === "true";

  if (!nameEn || !nameAr || number <= 0) return;

  await prisma.drop.create({
    data: {
      number,
      nameEn,
      nameAr,
      releaseAt: releaseAt ? new Date(releaseAt) : new Date(),
      closesAt: closesAt ? new Date(closesAt) : null,
      isLive,
    },
  });
  revalidatePath("/admin/drops");
  revalidatePath("/");
}

export async function updateDrop(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const releaseAt = String(formData.get("releaseAt") ?? "").trim();
  const closesAt = String(formData.get("closesAt") ?? "").trim();
  const isLive = formData.get("isLive") === "on";

  await prisma.drop.update({
    where: { id },
    data: {
      nameEn,
      nameAr,
      releaseAt: releaseAt ? new Date(releaseAt) : undefined,
      closesAt: closesAt ? new Date(closesAt) : null,
      isLive,
    },
  });
  revalidatePath("/admin/drops");
  revalidatePath("/");
}

export async function deleteDrop(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.drop.delete({ where: { id } });
  revalidatePath("/admin/drops");
}

// ── Discount Codes ──────────────────────────────────────────────────────────

export async function createDiscount(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "PERCENT") as "PERCENT" | "FIXED";
  const value = parseInt(String(formData.get("value") ?? "0"), 10);
  const minSubtotal = parseInt(String(formData.get("minSubtotal") ?? "0"), 10) || 0;
  const maxRedemptions = parseOptionalInt(formData.get("maxRedemptions"));
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!code || value <= 0) return;

  await prisma.discountCode.create({
    data: {
      code,
      type,
      value,
      minSubtotal,
      maxRedemptions,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    },
  });
  revalidatePath("/admin/discounts");
}

export async function toggleDiscount(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const dc = await prisma.discountCode.findUnique({ where: { id } });
  if (!dc) return;
  await prisma.discountCode.update({ where: { id }, data: { active: !dc.active } });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.discountCode.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export async function createReview(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const authorNameEn = String(formData.get("authorNameEn") ?? "").trim();
  const authorNameAr = String(formData.get("authorNameAr") ?? "").trim();
  const authorCityEn = String(formData.get("authorCityEn") ?? "").trim();
  const authorCityAr = String(formData.get("authorCityAr") ?? "").trim();
  const rating = Math.min(5, Math.max(1, parseInt(String(formData.get("rating") ?? "5"), 10) || 5));
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  const bodyAr = String(formData.get("bodyAr") ?? "").trim();
  const featuredOnHome = formData.get("featuredOnHome") === "true";

  if (!productId || !authorNameEn || !authorNameAr || !bodyEn || !bodyAr) return;

  await prisma.review.create({
    data: {
      productId, authorNameEn, authorNameAr, authorCityEn, authorCityAr,
      rating, bodyEn, bodyAr, featuredOnHome,
    },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  redirect("/admin/reviews");
}

export async function updateReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId") ?? "");
  const authorNameEn = String(formData.get("authorNameEn") ?? "").trim();
  const authorNameAr = String(formData.get("authorNameAr") ?? "").trim();
  const authorCityEn = String(formData.get("authorCityEn") ?? "").trim();
  const authorCityAr = String(formData.get("authorCityAr") ?? "").trim();
  const rating = Math.min(5, Math.max(1, parseInt(String(formData.get("rating") ?? "5"), 10) || 5));
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  const bodyAr = String(formData.get("bodyAr") ?? "").trim();
  const featuredOnHome = formData.get("featuredOnHome") === "true";

  if (!id || !productId || !authorNameEn || !authorNameAr || !bodyEn || !bodyAr) return;

  await prisma.review.update({
    where: { id },
    data: {
      productId, authorNameEn, authorNameAr, authorCityEn, authorCityAr,
      rating, bodyEn, bodyAr, featuredOnHome,
    },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  redirect("/admin/reviews?saved=1");
}

export async function toggleReviewFeatured(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  await prisma.review.update({ where: { id }, data: { featuredOnHome: !review.featuredOnHome } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  redirect("/admin/reviews");
}
