import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "./hash";
import { categories, products, productImages, users } from "./schema";

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const sql = neon(DATABASE_URL);
  const db = drizzle({ client: sql });

  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(categories);

  // ── Admin users ──
  const adminPassword = await hashPassword("admin123");
  const adminUsers = [
    { name: "Admin", email: "admin@zenherb.store", hashedPassword: adminPassword },
    { name: "Yash", email: "gupta25yash@gmail.com", hashedPassword: null },
    { name: "Sakshi", email: "sakshibhadke6@gmail.com", hashedPassword: null },
  ];

  for (const admin of adminUsers) {
    await db
      .insert(users)
      .values({ ...admin, role: "admin" as const })
      .onConflictDoUpdate({
        target: users.email,
        set: { role: "admin" as const },
      });
  }

  console.log("✓ Admin users created/promoted:")
  adminUsers.forEach((u) => console.log(`  - ${u.email}`));

  // ── Categories ──
  const categoryData = [
    {
      name: "Herbal Teas",
      slug: "herbal-teas",
      description: "Organic loose-leaf blends for calm and vitality",
      image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80",
    },
    {
      name: "Yoga Essentials",
      slug: "yoga-essentials",
      description: "Mats, blocks, straps, and more for your practice",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80",
    },
    {
      name: "Supplements",
      slug: "supplements",
      description: "Plant-based capsules, powders, and tinctures",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    },
    {
      name: "Aromatherapy",
      slug: "aromatherapy",
      description: "Essential oils, diffusers, and incense",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
    },
    {
      name: "Skincare",
      slug: "skincare",
      description: "Herbal balms, serums, and natural beauty",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    },
    {
      name: "Books & Guides",
      slug: "books-guides",
      description: "Deepen your knowledge of herbs and yoga",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoryData)
    .returning();
  console.log(`✓ ${insertedCategories.length} categories created`);

  const catMap = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c.id])
  );

  // ── Products ──
  const productData = [
    {
      name: "Chamomile Calm Blend",
      slug: "chamomile-calm-blend",
      description:
        "A soothing blend of organic chamomile, lavender, and lemon balm. Perfect for winding down in the evening. Hand-blended in small batches for peak freshness. Caffeine-free.",
      categoryId: catMap["herbal-teas"],
      price: "18.00",
      compareAtPrice: "24.00",
      sku: "TEA-CCB-001",
      stock: 80,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Tulsi Energy Infusion",
      slug: "tulsi-energy-infusion",
      description:
        "Holy basil (Tulsi) blended with ginger and green cardamom for a naturally energizing tea. Adaptogenic and stress-relieving. 50g loose-leaf pouch.",
      categoryId: catMap["herbal-teas"],
      price: "22.00",
      sku: "TEA-TEI-002",
      stock: 65,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Cork Yoga Mat",
      slug: "cork-yoga-mat",
      description:
        "Premium natural cork surface with a high-density rubber base. Non-slip grip that improves with moisture. 5mm thick, 183cm × 68cm. Antimicrobial and eco-friendly.",
      categoryId: catMap["yoga-essentials"],
      price: "78.00",
      compareAtPrice: "99.00",
      sku: "YGA-CYM-001",
      stock: 35,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Bamboo Yoga Block Set",
      slug: "bamboo-yoga-block-set",
      description:
        "Set of 2 lightweight bamboo yoga blocks. Rounded edges for comfort. Provides firm support for poses and stretches. Sustainably harvested bamboo.",
      categoryId: catMap["yoga-essentials"],
      price: "42.00",
      sku: "YGA-BYB-002",
      stock: 50,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Ashwagandha Root Capsules",
      slug: "ashwagandha-root-capsules",
      description:
        "Organic ashwagandha root extract, 600mg per capsule. KSM-66 standardized. Supports stress relief, focus, and restful sleep. 90 capsules per bottle.",
      categoryId: catMap["supplements"],
      price: "32.00",
      sku: "SUP-ARC-001",
      stock: 100,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Turmeric & Black Pepper Tincture",
      slug: "turmeric-black-pepper-tincture",
      description:
        "Concentrated turmeric extract with black pepper (piperine) for enhanced absorption. Supports joint health and inflammation response. 60ml dropper bottle.",
      categoryId: catMap["supplements"],
      price: "28.00",
      sku: "SUP-TBP-002",
      stock: 70,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Lavender Essential Oil",
      slug: "lavender-essential-oil",
      description:
        "100% pure steam-distilled lavender oil from French lavender fields. Calming aroma for sleep, relaxation, and meditation. 15ml amber glass bottle.",
      categoryId: catMap["aromatherapy"],
      price: "24.00",
      sku: "ARO-LEO-001",
      stock: 90,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Ceramic Oil Diffuser",
      slug: "ceramic-oil-diffuser",
      description:
        "Handcrafted ceramic ultrasonic diffuser with warm ambient lighting. Covers 30 sq meters. Whisper-quiet for meditation and yoga studios. Auto shut-off.",
      categoryId: catMap["aromatherapy"],
      price: "58.00",
      sku: "ARO-COD-002",
      stock: 25,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Calendula Healing Balm",
      slug: "calendula-healing-balm",
      description:
        "Soothing herbal balm made with organic calendula, beeswax, and coconut oil. For dry skin, minor irritations, and cracked hands. 60ml tin.",
      categoryId: catMap["skincare"],
      price: "19.00",
      sku: "SKN-CHB-001",
      stock: 60,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Rose Hip Face Serum",
      slug: "rose-hip-face-serum",
      description:
        "Cold-pressed rosehip oil blended with vitamin E and jojoba. Lightweight, fast-absorbing. Brightens, hydrates, and supports skin renewal. 30ml glass dropper.",
      categoryId: catMap["skincare"],
      price: "36.00",
      compareAtPrice: "48.00",
      sku: "SKN-RFS-002",
      stock: 40,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "The Yoga Anatomy Guide",
      slug: "the-yoga-anatomy-guide",
      description:
        "Illustrated guide to yoga postures and their anatomical benefits. 320 pages with full-color diagrams. Ideal for teachers and serious practitioners.",
      categoryId: catMap["books-guides"],
      price: "34.00",
      sku: "BOK-YAG-001",
      stock: 45,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Herbal Medicine Handbook",
      slug: "herbal-medicine-handbook",
      description:
        "Comprehensive reference covering 120 medicinal herbs — identification, preparation, dosage, and safety. Written by a certified herbalist. Hardcover, 480 pages.",
      categoryId: catMap["books-guides"],
      price: "42.00",
      sku: "BOK-HMH-002",
      stock: 30,
      isActive: true,
      isFeatured: true,
    },
  ];

  const insertedProducts = await db
    .insert(products)
    .values(productData)
    .returning();
  console.log(`✓ ${insertedProducts.length} products created`);

  // ── Product Images ──
  const imageMap: Record<string, string[]> = {
    "chamomile-calm-blend": [
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
      "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
    ],
    "tulsi-energy-infusion": [
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
    ],
    "cork-yoga-mat": [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    ],
    "bamboo-yoga-block-set": [
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80",
    ],
    "ashwagandha-root-capsules": [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80",
    ],
    "turmeric-black-pepper-tincture": [
      "https://images.unsplash.com/photo-1615485500710-aa71860b4a91?w=800&q=80",
    ],
    "lavender-essential-oil": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=800&q=80",
    ],
    "ceramic-oil-diffuser": [
      "https://images.unsplash.com/photo-1602607688066-8919900e7237?w=800&q=80",
    ],
    "calendula-healing-balm": [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
    ],
    "rose-hip-face-serum": [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&q=80",
      "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=800&q=80",
    ],
    "the-yoga-anatomy-guide": [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    ],
    "herbal-medicine-handbook": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    ],
  };

  const imageValues = insertedProducts.flatMap((product) => {
    const urls = imageMap[product.slug] || [];
    return urls.map((url, i) => ({
      productId: product.id,
      url,
      alt: product.name,
      displayOrder: i,
    }));
  });

  if (imageValues.length > 0) {
    await db.insert(productImages).values(imageValues);
    console.log(`✓ ${imageValues.length} product images created`);
  }

  console.log("\n✅ Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
