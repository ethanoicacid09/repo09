import { db } from "@/lib/db";
import { products, productImages } from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "./add-to-cart-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Truck, RotateCcw, Shield } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    if (!product) return { title: "Product Not Found" };
    return {
      title: product.name,
      description: product.description?.slice(0, 160),
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  let relatedProducts: {
    id: string;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    stock: number;
    images: { url: string; alt: string | null }[];
    category: { name: string };
  }[] = [];

  try {
    product = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.isActive, true)),
      with: { images: true, category: true },
    });

    if (product) {
      relatedProducts = await db.query.products.findMany({
        where: and(
          eq(products.categoryId, product.categoryId),
          ne(products.id, product.id),
          eq(products.isActive, true)
        ),
        with: { images: true, category: true },
        limit: 4,
      });
    }
  } catch {
    notFound();
  }

  if (!product) notFound();

  const numPrice = parseFloat(product.price);
  const numCompare = product.compareAtPrice
    ? parseFloat(product.compareAtPrice)
    : null;
  const onSale = numCompare && numCompare > numPrice;
  const mainImage = product.images[0]?.url ?? "/placeholder.svg";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <a href="/" className="hover:text-foreground">
              Home
            </a>
          </li>
          <li>/</li>
          <li>
            <a href="/products" className="hover:text-foreground">
              Products
            </a>
          </li>
          <li>/</li>
          <li>
            <a
              href={`/products?category=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </a>
          </li>
          <li>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {onSale && (
              <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground">
                Sale
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-bold">₹{numPrice.toFixed(2)}</p>
            {onSale && (
              <p className="text-lg text-muted-foreground line-through">
                ₹{numCompare.toFixed(2)}
              </p>
            )}
            {onSale && (
              <Badge variant="secondary">
                Save ₹{(numCompare - numPrice).toFixed(0)}
              </Badge>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {product.stock > 10 ? (
              <p className="text-sm text-primary">In stock</p>
            ) : product.stock > 0 ? (
              <p className="text-sm text-amber-600">
                Only {product.stock} left
              </p>
            ) : (
              <p className="text-sm text-destructive">Out of stock</p>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mt-8">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: numPrice,
                image: mainImage,
                stock: product.stock,
              }}
            />
          </div>

          {/* Features */}
          <div className="mt-8 space-y-3 border-t pt-8">
            {[
              { icon: Truck, text: "Free shipping on orders over $75" },
              { icon: RotateCcw, text: "30-day hassle-free returns" },
              { icon: Shield, text: "1-year quality guarantee" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                {text}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-8">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
              {product.sku && (
                <p className="mt-4 text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="mt-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Standard shipping: 5-7 business days</p>
                <p>Express shipping: 2-3 business days (+$12)</p>
                <p>Free shipping on all orders over $75</p>
                <p>
                  We ship to all 50 US states and select international
                  destinations.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            You might also like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                image={p.images[0]?.url ?? "/placeholder.svg"}
                category={p.category.name}
                stock={p.stock}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
