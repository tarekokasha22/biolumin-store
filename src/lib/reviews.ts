import "server-only";
import { prisma } from "./prisma";

export async function getReviewsForProduct(productId: string, take = 10) {
  return prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getFeaturedReviews(take = 6) {
  return prisma.review.findMany({
    where: { featuredOnHome: true },
    orderBy: { createdAt: "desc" },
    take,
    include: { product: { select: { slug: true, images: { orderBy: { order: "asc" }, take: 1 } } } },
  });
}

export type RatingSummary = { average: number; count: number };

export async function getProductRatingSummary(
  productId: string,
): Promise<RatingSummary> {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  return { average: agg._avg.rating ?? 0, count: agg._count };
}

// One query for a whole grid page instead of one aggregate per card.
export async function getRatingSummariesByProductIds(
  productIds: string[],
): Promise<Map<string, RatingSummary>> {
  if (productIds.length === 0) return new Map();
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: true,
  });
  const map = new Map<string, RatingSummary>();
  for (const row of rows) {
    map.set(row.productId, { average: row._avg.rating ?? 0, count: row._count });
  }
  return map;
}
