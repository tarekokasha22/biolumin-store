import { PrismaClient, ProductTier, ProductStatus } from "@prisma/client";
import { gradientPlaceholder } from "../src/lib/placeholder";

const prisma = new PrismaClient();

type Seed = {
  slug: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  compareAtPrice?: number;
  tier: ProductTier;
  category: string;
  size: string;
  status?: ProductStatus;
};

const products: Seed[] = [
  // ---- ANCHOR ----
  { slug: "obsidian-trench", nameAr: "كوت أوبسيديان", nameEn: "Obsidian Trench", descAr: "كوت طويل بقصّة واثقة وخامة تقيلة دافية. القطعة اللي تخلّي أي لوك يبان غالي.", descEn: "A long, confident-cut trench in heavy warm fabric. The piece that makes any look read luxe.", price: 2400, tier: "ANCHOR", category: "coats", size: "M" },
  { slug: "midnight-boots", nameAr: "بوت منتصف الليل", nameEn: "Midnight Boots", descAr: "بوت جلد بكعب مدروس، يمشي معاكي من الصبح للسهرة.", descEn: "Leather boots with a measured heel — from morning to evening.", price: 1900, compareAtPrice: 2300, tier: "ANCHOR", category: "boots", size: "39" },
  { slug: "gold-thread-blazer", nameAr: "بليزر خيط الدهب", nameEn: "Gold-Thread Blazer", descAr: "بليزر بقصّة حادّة ولمسة خيط ذهبي خفيّة في التفاصيل.", descEn: "A sharp-cut blazer with a subtle gold thread running through the details.", price: 1750, tier: "ANCHOR", category: "coats", size: "S" },
  { slug: "deep-sea-coat", nameAr: "كوت الأعماق", nameEn: "Deep-Sea Coat", descAr: "كوت بلون غامق وملمس ناعم، إحساس عمق وهدوء.", descEn: "A deep-toned coat with a soft hand — depth and calm.", price: 2200, tier: "ANCHOR", category: "coats", size: "L", status: "SOLD" },

  // ---- HERO ----
  { slug: "luminous-slip-dress", nameAr: "فستان النور", nameEn: "Luminous Slip Dress", descAr: "فستان سليب انسيابي بيلمس الجسم برقّة. لحظة توهّج كاملة.", descEn: "A fluid slip dress that grazes the body. A full glow moment.", price: 1200, tier: "HERO", category: "dresses", size: "M" },
  { slug: "champagne-satin-dress", nameAr: "فستان ساتان شامبين", nameEn: "Champagne Satin Dress", descAr: "ساتان بلون الشامبين بيعكس النور. للمناسبات اللي تستاهل.", descEn: "Champagne satin that catches the light. For occasions that deserve it.", price: 1350, compareAtPrice: 1600, tier: "HERO", category: "dresses", size: "S" },
  { slug: "ivory-column-dress", nameAr: "فستان العاج", nameEn: "Ivory Column Dress", descAr: "فستان طويل بخط مستقيم أنيق، بساطة واثقة.", descEn: "A long, clean-column dress — confident simplicity.", price: 1150, tier: "HERO", category: "dresses", size: "L" },
  { slug: "aurora-wrap-dress", nameAr: "فستان أورورا", nameEn: "Aurora Wrap Dress", descAr: "فستان كروس بقصّة بتمجّد القوام، حركة وانسيابية.", descEn: "A wrap dress cut to flatter — movement and flow.", price: 980, tier: "HERO", category: "dresses", size: "M", status: "SOLD" },
  { slug: "noir-tailored-trousers", nameAr: "بنطلون نوار", nameEn: "Noir Tailored Trousers", descAr: "بنطلون قصّة عالية مفصّل بإتقان، يطوّل ويأنّق.", descEn: "High-waisted, precisely tailored trousers that lengthen and refine.", price: 720, tier: "HERO", category: "pants", size: "M" },
  { slug: "glow-silk-shirt", nameAr: "قميص حرير التوهّج", nameEn: "Glow Silk Shirt", descAr: "قميص حرير بيسيل على الجسم، لمعة هادية راقية.", descEn: "A silk shirt that pours over the body — a quiet, refined sheen.", price: 850, compareAtPrice: 1080, tier: "HERO", category: "shirts", size: "S" },
  { slug: "velvet-evening-dress", nameAr: "فستان قطيفة السهرة", nameEn: "Velvet Evening Dress", descAr: "قطيفة عميقة بإحساس فخم للّيالي المميّزة.", descEn: "Deep velvet with a sumptuous feel for special nights.", price: 1280, tier: "HERO", category: "dresses", size: "M" },
  { slug: "luminous-leather-skirt", nameAr: "جيبة جلد لامعة", nameEn: "Luminous Leather Skirt", descAr: "جيبة جلد بقصّة مودرن، ستيتمنت بيكمّل أي لوك.", descEn: "A modern-cut leather skirt — a statement that completes any look.", price: 900, tier: "HERO", category: "pants", size: "S" },

  // ---- ENTRY ----
  { slug: "ivory-essential-blouse", nameAr: "بلوزة العاج", nameEn: "Ivory Essential Blouse", descAr: "بلوزة عاجي بخامة ناعمة، الأساس اللي بيكمّل كل حاجة.", descEn: "An ivory blouse in soft fabric — the essential that finishes everything.", price: 520, tier: "ENTRY", category: "blouses", size: "M" },
  { slug: "champagne-knit-top", nameAr: "توب تريكو شامبين", nameEn: "Champagne Knit Top", descAr: "تريكو ناعم بلمسة دافية، يلبس بسهولة ويبان شيك.", descEn: "Soft knit with a warm touch — easy to wear, effortlessly chic.", price: 460, compareAtPrice: 600, tier: "ENTRY", category: "blouses", size: "S" },
  { slug: "silk-camisole", nameAr: "كاميزول حرير", nameEn: "Silk Camisole", descAr: "كاميزول حرير رقيق، طبقة أساسية بإحساس فاخر.", descEn: "A delicate silk camisole — a base layer with a luxe feel.", price: 380, tier: "ENTRY", category: "blouses", size: "M" },
  { slug: "greige-linen-shirt", nameAr: "قميص كتان جريج", nameEn: "Greige Linen Shirt", descAr: "قميص كتان بلون محايد دافي، راحة وأناقة.", descEn: "A neutral warm-greige linen shirt — comfort and elegance.", price: 540, tier: "ENTRY", category: "shirts", size: "L" },
  { slug: "satin-slip-top", nameAr: "توب ساتان", nameEn: "Satin Slip Top", descAr: "توب ساتان بحمّالات رفيعة، لمعة ناعمة للمساء.", descEn: "A thin-strap satin top — a soft evening sheen.", price: 420, tier: "ENTRY", category: "blouses", size: "S", status: "SOLD" },
  { slug: "soft-wool-cardigan", nameAr: "كارديجان صوف ناعم", nameEn: "Soft Wool Cardigan", descAr: "كارديجان صوف بيلفّك بدفا، لمسة كوزي راقية.", descEn: "A soft wool cardigan that wraps you warm — refined coziness.", price: 580, tier: "ENTRY", category: "blouses", size: "M" },
  { slug: "minimal-white-sneakers", nameAr: "كوتشي أبيض مينيمال", nameEn: "Minimal White Sneakers", descAr: "كوتشي نضيف بسيط، بيكمّل اللوك الكاجوال الشيك.", descEn: "Clean, minimal sneakers that complete a chic-casual look.", price: 650, tier: "ENTRY", category: "sneakers", size: "38" },
  { slug: "warm-ivory-scarf", nameAr: "إيشارب عاجي دافي", nameEn: "Warm Ivory Scarf", descAr: "إيشارب ناعم بلمسة نور، تفصيلة بتكمّل اللوك.", descEn: "A soft scarf with a touch of light — the detail that finishes a look.", price: 290, tier: "ENTRY", category: "blouses", size: "OS" },
  { slug: "tailored-wide-pants", nameAr: "بنطلون واسع مفصّل", nameEn: "Tailored Wide Pants", descAr: "بنطلون واسع بقصّة بتطوّل، إحساس حرية وأناقة.", descEn: "Wide tailored pants that lengthen — freedom with elegance.", price: 590, tier: "ENTRY", category: "pants", size: "M" },
  { slug: "glow-gold-belt", nameAr: "حزام الدهب", nameEn: "Glow Gold Belt", descAr: "حزام بلمسة ذهبية، بيشدّ اللوك ويديله توقيع.", descEn: "A belt with a golden touch — it cinches a look and signs it.", price: 320, tier: "ENTRY", category: "blouses", size: "OS" },
  { slug: "deep-teal-blouse", nameAr: "بلوزة تيل غامق", nameEn: "Deep Teal Blouse", descAr: "بلوزة بلون تيل عميق، لمسة لون هادية ومميّزة.", descEn: "A deep-teal blouse — a calm, distinctive touch of color.", price: 500, tier: "ENTRY", category: "blouses", size: "S" },
];

async function main() {
  await prisma.paymentProof.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.drop.deleteMany();
  await prisma.discountCode.deleteMany();

  const drop = await prisma.drop.create({
    data: { number: 1, nameAr: "الدروب الأول", nameEn: "First Drop", isLive: true },
  });

  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        descAr: p.descAr,
        descEn: p.descEn,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        tier: p.tier,
        category: p.category,
        size: p.size,
        status: p.status ?? "AVAILABLE",
        dropId: drop.id,
        images: {
          create: [
            { url: gradientPlaceholder(p.slug, p.nameEn), alt: p.nameEn, order: 0 },
            { url: gradientPlaceholder(p.slug + "-2", p.nameEn), alt: p.nameEn, order: 1 },
          ],
        },
      },
    });
  }

  await prisma.discountCode.createMany({
    data: [
      // Welcome code: 10% off any order.
      { code: "LUMIN10", type: "PERCENT", value: 10, minSubtotal: 0, active: true },
      // First-light: 150 EGP off orders over 1000.
      { code: "FIRSTLIGHT", type: "FIXED", value: 150, minSubtotal: 1000, active: true },
      // Limited drop code: 15% off, capped at 50 redemptions.
      { code: "GLOW15", type: "PERCENT", value: 15, minSubtotal: 1500, maxRedemptions: 50, active: true },
    ],
  });

  console.log(
    `Seeded ${products.length} pieces in drop #${drop.number} + 3 discount codes.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
