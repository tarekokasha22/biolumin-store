/**
 * Biolumin — Fresh Start Reset Script
 * Deletes all test orders, resets all product statuses to AVAILABLE,
 * resets sortOrder to 0, clears test subscribers and reviews.
 * Run with: node reset.mjs
 */

import { PrismaClient } from "@prisma/client";

// Use the direct (non-pooled) connection for bulk operations
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log("🔄  Connecting to Neon...");

  // ── 1. Delete all orders (cascades to OrderItem + PaymentProof) ─────────────
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`🗑   Deleted ${deletedOrders.count} orders`);

  // ── 2. Reset all products to AVAILABLE + clear sortOrder + reservedUntil ────
  const resetProducts = await prisma.product.updateMany({
    data: {
      status: "AVAILABLE",
      sortOrder: 0,
      reservedUntil: null,
    },
  });
  console.log(`✅   Reset ${resetProducts.count} products → AVAILABLE`);

  // ── 3. Delete all subscribers ────────────────────────────────────────────────
  const deletedSubs = await prisma.subscriber.deleteMany({});
  console.log(`🗑   Deleted ${deletedSubs.count} subscribers`);

  // ── 4. Delete all reviews ────────────────────────────────────────────────────
  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`🗑   Deleted ${deletedReviews.count} reviews`);

  // ── 5. Delete all discount codes ─────────────────────────────────────────────
  const deletedDiscounts = await prisma.discountCode.deleteMany({});
  console.log(`🗑   Deleted ${deletedDiscounts.count} discount codes`);

  console.log("\n🎉  Done! Your store is clean and ready for real work.");
  console.log("    All products are now AVAILABLE with sortOrder reset to 0.");
}

main()
  .catch((e) => {
    console.error("❌  Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
