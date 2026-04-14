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

  // ── Admin user ──
  const adminPassword = await hashPassword("admin123");
  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@verdant.store",
      hashedPassword: adminPassword,
      role: "admin",
    })
    .onConflictDoNothing();

  console.log("✓ Admin user created (admin@verdant.store / admin123)");

  // ── Categories ──
  const categoryData = [
    {
      name: "Clothing",
      slug: "clothing",
      description: "Everyday essentials built to last",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Finishing touches for every look",
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80",
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description: "Thoughtful objects for your space",
      image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&q=80",
    },
    {
      name: "Outdoor",
      slug: "outdoor",
      description: "Gear for your next adventure",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
    },
    {
      name: "Wellness",
      slug: "wellness",
      description: "Self-care, elevated",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    },
    {
      name: "Stationery",
      slug: "stationery",
      description: "Write, plan, and create",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80",
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
      name: "Merino Wool Crewneck",
      slug: "merino-wool-crewneck",
      description:
        "Ultra-soft merino wool crewneck sweater with a relaxed fit. Temperature-regulating and naturally odor-resistant. Perfect for layering or wearing on its own through the cooler months.",
      categoryId: catMap["clothing"],
      price: "89.00",
      compareAtPrice: "120.00",
      sku: "CLO-MWC-001",
      stock: 45,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Organic Cotton Tee",
      slug: "organic-cotton-tee",
      description:
        "Classic crew neck tee made from 100% certified organic cotton. Pre-shrunk, garment-dyed for a lived-in softness from day one. Available in earth tones.",
      categoryId: catMap["clothing"],
      price: "38.00",
      sku: "CLO-OCT-002",
      stock: 120,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Canvas Weekender Bag",
      slug: "canvas-weekender-bag",
      description:
        "Waxed canvas weekender with leather trim and solid brass hardware. Sized for overhead bins. Interior zip pocket and padded laptop sleeve. Ages beautifully.",
      categoryId: catMap["accessories"],
      price: "165.00",
      sku: "ACC-CWB-001",
      stock: 22,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Leather Card Wallet",
      slug: "leather-card-wallet",
      description:
        "Slim vegetable-tanned leather card wallet. Four card slots plus a center pocket for cash. Fits front or back pocket without bulk.",
      categoryId: catMap["accessories"],
      price: "45.00",
      sku: "ACC-LCW-002",
      stock: 67,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Ceramic Pour-Over Set",
      slug: "ceramic-pour-over-set",
      description:
        "Hand-thrown ceramic pour-over dripper with matching carafe. Matte glaze exterior, glazed interior for easy cleaning. Makes 2-3 cups of exceptional coffee.",
      categoryId: catMap["home-living"],
      price: "72.00",
      sku: "HOM-CPS-001",
      stock: 30,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Linen Throw Blanket",
      slug: "linen-throw-blanket",
      description:
        "Stonewashed linen throw blanket with fringed edges. Lightweight and breathable for all seasons. 140cm × 200cm. Gets softer with every wash.",
      categoryId: catMap["home-living"],
      price: "95.00",
      compareAtPrice: "130.00",
      sku: "HOM-LTB-002",
      stock: 18,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Trail Running Pack",
      slug: "trail-running-pack",
      description:
        "Ultralight 12L running vest with dual front water bottle pockets, zippered main compartment, and adjustable sternum straps. Reflective accents for visibility.",
      categoryId: catMap["outdoor"],
      price: "128.00",
      sku: "OUT-TRP-001",
      stock: 35,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Bamboo Water Bottle",
      slug: "bamboo-water-bottle",
      description:
        "Double-walled stainless steel bottle with natural bamboo cap. Keeps drinks cold 24hrs or hot 12hrs. 750ml capacity. BPA-free.",
      categoryId: catMap["outdoor"],
      price: "34.00",
      sku: "OUT-BWB-002",
      stock: 88,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Essential Oil Diffuser",
      slug: "essential-oil-diffuser",
      description:
        "Ultrasonic aroma diffuser with warm ambient lighting. Covers up to 30 sq meters. Auto shut-off. Quiet operation for bedrooms and workspaces.",
      categoryId: catMap["wellness"],
      price: "58.00",
      sku: "WEL-EOD-001",
      stock: 40,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Natural Soy Candle Set",
      slug: "natural-soy-candle-set",
      description:
        "Set of three hand-poured soy wax candles in reusable ceramic vessels. Scents: Cedar & Sage, Bergamot, and Fireside. 45-hour burn time each.",
      categoryId: catMap["wellness"],
      price: "52.00",
      sku: "WEL-NSC-002",
      stock: 55,
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Dot Grid Notebook",
      slug: "dot-grid-notebook",
      description:
        "A5 dot grid notebook with 192 pages of 100gsm cream paper. Lay-flat binding, ribbon bookmark, and elastic closure. Thread-sewn for durability.",
      categoryId: catMap["stationery"],
      price: "24.00",
      sku: "STA-DGN-001",
      stock: 150,
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Brass Pen Set",
      slug: "brass-pen-set",
      description:
        "Pair of solid brass pens — one ballpoint, one rollerball. Develops a unique patina over time. Refillable with standard international cartridges.",
      categoryId: catMap["stationery"],
      price: "68.00",
      sku: "STA-BPS-002",
      stock: 25,
      isActive: true,
      isFeatured: false,
    },
  ];

  const insertedProducts = await db
    .insert(products)
    .values(productData)
    .returning();
  console.log(`✓ ${insertedProducts.length} products created`);

  // ── Product Images ──
  const imageMap: Record<string, string[]> = {
    "merino-wool-crewneck": [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a65?w=800&q=80",
    ],
    "organic-cotton-tee": [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    ],
    "canvas-weekender-bag": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
    "leather-card-wallet": [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    ],
    "ceramic-pour-over-set": [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800&q=80",
    ],
    "linen-throw-blanket": [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    "trail-running-pack": [
      "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80",
    ],
    "bamboo-water-bottle": [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    ],
    "essential-oil-diffuser": [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
    ],
    "natural-soy-candle-set": [
      "https://images.unsplash.com/photo-1602607688066-8919900e7237?w=800&q=80",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
    ],
    "dot-grid-notebook": [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
    ],
    "brass-pen-set": [
      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80",
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
