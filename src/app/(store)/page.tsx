import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Shield, Leaf, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { products, productImages, categories } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { ProductCard } from "@/components/store/product-card";

async function getFeaturedProducts() {
  const result = await db.query.products.findMany({
    where: eq(products.isFeatured, true),
    with: { images: true, category: true },
    orderBy: desc(products.createdAt),
    limit: 8,
  });
  return result;
}

async function getCategories() {
  return db.query.categories.findMany({
    limit: 6,
  });
}

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let allCategories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [featuredProducts, allCategories] = await Promise.all([
      getFeaturedProducts(),
      getCategories(),
    ]);
  } catch {
    // DB not connected yet — render with empty data
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 py-20 lg:grid-cols-2 lg:gap-16 lg:py-32">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-widest text-primary">
                Rooted in nature
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Herbs & yoga
                <br />
                <span className="text-primary">for mindful</span>
                <br />
                living
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Premium herbal remedies, organic teas, and yoga essentials — crafted
                to nurture your body, calm your mind, and elevate your practice.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/products?category=yoga-essentials">
                    Yoga Essentials
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"
                  alt="Herbs and yoga essentials"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 rounded-xl border bg-card p-4 shadow-lg">
                <p className="text-2xl font-bold text-primary">2,000+</p>
                <p className="text-xs text-muted-foreground">Happy practitioners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $75" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day return window" },
              { icon: Shield, title: "Lab Tested", desc: "Purity guaranteed" },
              { icon: Leaf, title: "100% Organic", desc: "Certified ingredients" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Featured Products
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Hand-picked favorites from our collection
                </p>
              </div>
              <Link
                href="/products"
                className="hidden text-sm font-medium text-primary hover:underline sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images[0]?.url ?? "/placeholder.svg"}
                  category={product.category.name}
                  stock={product.stock}
                />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all products →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      {allCategories.length > 0 && (
        <section className="bg-muted/30 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find exactly what you&apos;re looking for
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
              {allCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-xl bg-muted aspect-[3/2]"
                >
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-white">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-1 text-sm text-white/70 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-6 py-16 text-center sm:px-16">
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              New herbs & classes every week
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Sign up for our newsletter and be the first to know about new
              herbal blends, yoga class schedules, and wellness tips.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                asChild
              >
                <Link href="/products">Explore Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
