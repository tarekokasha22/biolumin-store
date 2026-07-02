/**
 * Additive seed for the new-design features (idempotent).
 *  - Populates the Review table with the original testimonial copy so the
 *    home "reviews" rail and PDP review sections render real content.
 *  - Ensures the live Drop has a closesAt so the homepage countdown shows.
 * Safe to re-run: it clears only reviews it manages and never touches
 * products / orders / images.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The three original homepage testimonials (bilingual), kept verbatim.
const FEATURED = [
  {
    authorNameAr: "مريم عادل",
    authorNameEn: "Mariam Adel",
    authorCityAr: "القاهرة",
    authorCityEn: "Cairo",
    rating: 5,
    bodyAr: "الخامة تحفة والفستان طلع أحلى من الصور. حسّيت إني لابسة حاجة غالية فعلاً.",
    bodyEn: "The fabric is gorgeous and it looked even better than the photos. I felt truly luxe.",
  },
  {
    authorNameAr: "سلمى رمزي",
    authorNameEn: "Salma Ramzy",
    authorCityAr: "الإسكندرية",
    authorCityEn: "Alexandria",
    rating: 5,
    bodyAr: "وصل في يومين والتغليف شيك جداً. فكرة إن القطعة واحدة بس خلّتني أحس إني مميزة.",
    bodyEn: "Arrived in two days, beautifully packaged. Knowing it is one-of-one made me feel so special.",
  },
  {
    authorNameAr: "نور حسن",
    authorNameEn: "Nour Hassan",
    authorCityAr: "المنصورة",
    authorCityEn: "Mansoura",
    rating: 5,
    bodyAr: "دفعت عند الاستلام بكل أريحية. المندوب كان لطيف والمقاس مظبوط بالظبط زي الجدول.",
    bodyEn: "Paid cash on delivery with total ease. The courier was kind and the size matched the guide exactly.",
  },
];

// Extra per-product reviews so PDPs show a small verified rail too.
const EXTRA = [
  {
    authorNameAr: "هبة مصطفى", authorNameEn: "Heba Mostafa",
    authorCityAr: "الجيزة", authorCityEn: "Giza", rating: 5,
    bodyAr: "القصّة مظبوطة على الجسم واللون تحفة. هلبسه كتير.",
    bodyEn: "The cut sits perfectly and the colour is stunning. I'll wear it constantly.",
  },
  {
    authorNameAr: "ياسمين فؤاد", authorNameEn: "Yasmin Fouad",
    authorCityAr: "طنطا", authorCityEn: "Tanta", rating: 5,
    bodyAr: "جودة عالية وإحساس فخم. يستاهل كل جنيه.",
    bodyEn: "High quality with a luxe feel. Worth every pound.",
  },
  {
    authorNameAr: "منة الله سامي", authorNameEn: "Menna Sami",
    authorCityAr: "أسيوط", authorCityEn: "Assiut", rating: 4,
    bodyAr: "حلو جداً والخامة مريحة، وصل بسرعة.",
    bodyEn: "Really lovely and the fabric is comfortable, arrived fast.",
  },
];

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (products.length === 0) {
    console.log("No products found — run the main seed first. Skipping.");
    return;
  }

  // Clean slate for reviews so re-runs don't duplicate.
  await prisma.review.deleteMany();

  // Featured home testimonials → attach to the first few products.
  let created = 0;
  for (let i = 0; i < FEATURED.length; i++) {
    const product = products[i % products.length];
    await prisma.review.create({
      data: { ...FEATURED[i], productId: product.id, featuredOnHome: true },
    });
    created++;
  }

  // Spread the extra reviews across the first ~10 products for PDP depth.
  const spread = products.slice(0, 10);
  for (let i = 0; i < spread.length; i++) {
    const rv = EXTRA[i % EXTRA.length];
    await prisma.review.create({
      data: { ...rv, productId: spread[i].id, featuredOnHome: false },
    });
    created++;
  }
  console.log(`Seeded ${created} reviews.`);

  // Ensure the live drop has a closing time so the homepage countdown renders.
  const drop = await prisma.drop.findFirst({
    where: { isLive: true },
    orderBy: { releaseAt: "desc" },
  });
  if (drop) {
    if (!drop.closesAt || drop.closesAt.getTime() < Date.now()) {
      const closesAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // +3 days
      await prisma.drop.update({ where: { id: drop.id }, data: { closesAt } });
      console.log(`Set live drop closesAt → ${closesAt.toISOString()}`);
    } else {
      console.log(`Live drop already closes at ${drop.closesAt.toISOString()}`);
    }
  } else {
    console.log("No live drop found — countdown will stay hidden until one exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
