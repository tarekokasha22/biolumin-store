import "server-only";
import { prisma } from "./prisma";

// Lazy sweep: release expired reservations back to AVAILABLE. This is a DB
// *write*, so running it on every catalog read added a full round-trip of
// latency to every page load. Placed orders now hold pieces indefinitely
// (reservedUntil = null), so expired holds are rare — we throttle the sweep to
// at most once per SWEEP_INTERVAL per server instance. Pass force=true from the
// order path where correctness must be immediate.
const SWEEP_INTERVAL_MS = 30_000;
let lastSweepAt = 0;

export async function releaseExpiredReservations(force = false) {
  const now = Date.now();
  if (!force && now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
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

export async function getLiveDrop() {
  return prisma.drop.findFirst({ where: { isLive: true }, orderBy: { releaseAt: "desc" } });
}

export type CatalogProduct = Awaited<ReturnType<typeof getProducts>>[number];
