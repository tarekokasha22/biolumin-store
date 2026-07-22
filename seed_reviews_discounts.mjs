import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌸 Restoring original Discounts & Customer Reviews...");

  // 1. Restore Original Discount Codes from seed
  const discounts = [
    { code: "LUMIN10", type: "PERCENT", value: 10, minSubtotal: 0, active: true },
    { code: "FIRSTLIGHT", type: "FIXED", value: 150, minSubtotal: 1000, active: true },
    { code: "GLOW15", type: "PERCENT", value: 15, minSubtotal: 1500, maxRedemptions: 50, active: true },
  ];

  for (const d of discounts) {
    await prisma.discountCode.upsert({
      where: { code: d.code },
      update: { value: d.value, minSubtotal: d.minSubtotal, active: d.active },
      create: {
        code: d.code,
        type: d.type,
        value: d.value,
        minSubtotal: d.minSubtotal,
        maxRedemptions: d.maxRedemptions ?? null,
        active: d.active,
      },
    });
    console.log(`✅ Discount code active: ${d.code}`);
  }

  // 2. Attach reviews to products
  const products = await prisma.product.findMany({ take: 10 });
  if (products.length === 0) {
    console.log("⚠️ No products found in DB to attach reviews.");
    return;
  }

  await prisma.review.deleteMany({});

  const reviewsData = [
    {
      authorNameEn: "Nour Al-Hassan",
      authorNameAr: "نور الحسن",
      authorCityEn: "Cairo",
      authorCityAr: "القاهرة",
      rating: 5,
      bodyEn: "The fabric quality and tailoring are exquisite! Truly a piece of art. Fits like it was custom made.",
      bodyAr: "جودة القماش والتفصيل خرافية! قطعة فنية حقيقية والتفصيل مضبوط جداً.",
      featuredOnHome: true,
    },
    {
      authorNameEn: "Salma Farouk",
      authorNameAr: "سلمى فاروق",
      authorCityEn: "Alexandria",
      authorCityAr: "الإسكندرية",
      rating: 5,
      bodyEn: "Fast delivery and the packaging felt so luxurious. Will definitely order from every new drop!",
      bodyAr: "التوصيل سريع والتغليف فخم جداً. هطلب بالتأكيد من كل دروب جديد!",
      featuredOnHome: true,
    },
    {
      authorNameEn: "Farida Ezzat",
      authorNameAr: "فريدة عزت",
      authorCityEn: "Giza",
      authorCityAr: "الجيزة",
      rating: 5,
      bodyEn: "Subtle elegance. Wore it to an evening gala and received compliments all night long.",
      bodyAr: "أناقة هادئة وراقية. ارتديته في حفل وعجب كل الحضور وتساءلوا عنه.",
      featuredOnHome: true,
    },
    {
      authorNameEn: "Yasmin El-Sayed",
      authorNameAr: "ياسمين السيد",
      authorCityEn: "Mansoura",
      authorCityAr: "المنصورة",
      rating: 5,
      bodyEn: "Exclusive feeling knowing it's one-of-one! Exceptional attention to detail.",
      bodyAr: "إحساس رائع بامتلاك قطعة وحيدة فريدة! اهتمام غير عادي بالتفاصيل.",
      featuredOnHome: true,
    },
    {
      authorNameEn: "Mariam Sherif",
      authorNameAr: "مريم شريف",
      authorCityEn: "Zayed",
      authorCityAr: "الشيخ زايد",
      rating: 5,
      bodyEn: "Colors in real life are even more vibrant than photos. Obsessed with Biolumin!",
      bodyAr: "الألوان على الواقع أجمل بكثير من الصور. مهووسة بقطع بايولومين!",
      featuredOnHome: true,
    },
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    const r = reviewsData[i];
    const product = products[i % products.length];
    await prisma.review.create({
      data: {
        productId: product.id,
        authorNameEn: r.authorNameEn,
        authorNameAr: r.authorNameAr,
        authorCityEn: r.authorCityEn,
        authorCityAr: r.authorCityAr,
        rating: r.rating,
        bodyEn: r.bodyEn,
        bodyAr: r.bodyAr,
        featuredOnHome: r.featuredOnHome,
      },
    });
    console.log(`⭐ Added review from ${r.authorNameEn}`);
  }

  console.log("🎉 Successfully restored discounts and reviews!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
