import { prisma } from "@/lib/prisma";

// Feeds the simulated Live Activity toast — real reviewer names/cities and
// real product photos, recombined into fake "just bought" events. Purely
// presentational; no real order data is read or implied here.
export async function GET() {
  const [reviews, products] = await Promise.all([
    prisma.review.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      select: { authorNameAr: true, authorNameEn: true, authorCityAr: true, authorCityEn: true },
    }),
    prisma.product.findMany({
      where: { status: { not: "SOLD" } },
      take: 12,
      orderBy: { createdAt: "desc" },
      select: { nameAr: true, nameEn: true, images: { take: 1, orderBy: { order: "asc" } } },
    }),
  ]);

  return Response.json({
    people: reviews.map((r) => ({
      nameAr: r.authorNameAr,
      nameEn: r.authorNameEn,
      cityAr: r.authorCityAr,
      cityEn: r.authorCityEn,
    })),
    products: products.map((p) => ({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      image: p.images[0]?.url ?? null,
    })),
  });
}
