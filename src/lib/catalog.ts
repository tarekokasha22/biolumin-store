import "server-only";
import { prisma } from "./prisma";

// Lazy sweep: release expired reservations back to AVAILABLE on each read.
export async function releaseExpiredReservations() {
  await prisma.product.updateMany({
    where: { status: "RESERVED", reservedUntil: { lt: new Date() } },
    data: { status: "AVAILABLE", reservedUntil: null },
  });
}

export async function getProducts() {
  await releaseExpiredReservations();
  return prisma.product.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export async function getProductBySlug(slug: string) {
  await releaseExpiredReservations();
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export async function getRelatedProducts(
  category: string,
  excludeSlug: string,
  take = 3,
) {
  return prisma.product.findMany({
    where: { category, slug: { not: excludeSlug }, status: "AVAILABLE" },
    take,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export type CatalogProduct = Awaited<ReturnType<typeof getProducts>>[number];
