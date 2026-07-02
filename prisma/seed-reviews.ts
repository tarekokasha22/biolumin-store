import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The three original homepage testimonials — kept verbatim from the pre-redesign
// storefront so the featured-review rail reads exactly as it always did.
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

// A small pool so every product detail page shows a couple of believable,
// on-brand reviews. Rotated across products.
const POOL = [
  {
    authorNameAr: "هبة مصطفى", authorNameEn: "Heba Mostafa",
    authorCityAr: "الجيزة", authorCityEn: "Giza", rating: 5,
    bodyAr: "القصّة مظبوطة والخامة تحفة، حسّيت إنها متفصّلة عليّا.",
    bodyEn: "The cut is spot on and the fabric is beautiful — it felt made for me.",
  },
  {
    authorNameAr: "ياسمين خالد", authorNameEn: "Yasmin Khaled",
    authorCityAr: "طنطا", authorCityEn: "Tanta", rating: 5,
    bodyAr: "فكرة القطعة الواحدة عجبتني جداً، حاجة مالهاش تاني.",
    bodyEn: "I love that it's one-of-one — there's nothing else like it.",
  },
  {
    authorNameAr: "منة الله أحمد", authorNameEn: "Menna Ahmed",
    authorCityAr: "الإسماعيلية", authorCityEn: "Ismailia", rating: 4,
    bodyAr: "التغليف راقي والتوصيل سريع، تجربة شراء مريحة.",
    bodyEn: "Elegant packaging and fast delivery — a smooth shopping experience.",
  },
  {
    authorNameAr: "دينا سامي", authorNameEn: "Dina Samy",
    authorCityAr: "الأقصر", authorCityEn: "Luxor", rating: 5,
    bodyAr: "اللون في الطبيعة أحلى من الصورة، وخامته دافية وناعمة.",
    bodyEn: "The color is even nicer in person, and the fabric is warm and soft.",
  },
];

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, status: true },
  });
  if (products.length === 0) {
    console.log("No products found — run the product seed first.");
    return;
  }

  await prisma.review.deleteMany();

  const hosts = products.filter((p) => p.status !== "SOLD").slice(0, FEATURED.length);
  const featuredHosts = hosts.length >= FEATURED.length ? hosts : products.slice(0, FEATURED.length);
  let featuredCount = 0;
  for (let i = 0; i < FEATURED.length; i++) {
    await prisma.review.create({
      data: { ...FEATURED[i], featuredOnHome: true, productId: featuredHosts[i].id },
    });
    featuredCount++;
  }

  let perProduct = 0;
  for (let i = 0; i < products.length; i++) {
    const a = POOL[i % POOL.length];
    const b = POOL[(i + 2) % POOL.length];
    for (const rv of [a, b]) {
      await prisma.review.create({
        data: { ...rv, featuredOnHome: false, productId: products[i].id },
      });
      perProduct++;
    }
  }

  console.log(`Seeded ${featuredCount} featured + ${perProduct} product reviews across ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
