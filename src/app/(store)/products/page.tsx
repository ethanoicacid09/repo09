import { db } from "@/lib/db";
import { products, categories } from "@/lib/schema";
import { eq, desc, asc, ilike, and, sql } from "drizzle-orm";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/store/search-input";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full collection of herbs, remedies, and yoga essentials at ZenHerb.",
};

interface Props {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;

  let allCategories: { id: string; name: string; slug: string }[] = [];
  let result: {
    id: string;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    stock: number;
    images: { url: string; alt: string | null }[];
    category: { name: string };
  }[] = [];
  let totalCount = 0;

  try {
    allCategories = await db.query.categories.findMany({
      columns: { id: true, name: true, slug: true },
    });

    // Build conditions
    const conditions = [eq(products.isActive, true)];

    if (params.category) {
      const cat = allCategories.find((c) => c.slug === params.category);
      if (cat) {
        conditions.push(eq(products.categoryId, cat.id));
      }
    }

    if (params.q) {
      conditions.push(
        sql`(${ilike(products.name, `%${params.q}%`)} OR ${ilike(products.description, `%${params.q}%`)})`
      );
    }

    const where = and(...conditions);

    // Sort
    let orderBy;
    switch (params.sort) {
      case "price-asc":
        orderBy = asc(products.price);
        break;
      case "price-desc":
        orderBy = desc(products.price);
        break;
      case "name":
        orderBy = asc(products.name);
        break;
      default:
        orderBy = desc(products.createdAt);
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where);
    totalCount = Number(countResult.count);

    result = await db.query.products.findMany({
      where,
      with: { images: true, category: true },
      orderBy,
      limit: PAGE_SIZE,
      offset,
    });
  } catch {
    // DB not connected
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const activeCategory = params.category;

  // Build query string helper
  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (params.category) p.set("category", params.category);
    if (params.sort) p.set("sort", params.sort);
    if (params.q) p.set("q", params.q);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    const str = p.toString();
    return `/products${str ? `?${str}` : ""}`;
  }

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low → High" },
    { value: "price-desc", label: "Price: High → Low" },
    { value: "name", label: "Name" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeCategory
              ? allCategories.find((c) => c.slug === activeCategory)?.name ??
                "Products"
              : "All Products"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput />
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="sticky top-24 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium">Categories</h3>
              <div className="mt-3 space-y-1">
                <Link
                  href="/products"
                  className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                    !activeCategory
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </Link>
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildHref({
                      category: cat.slug,
                      page: undefined,
                    })}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      activeCategory === cat.slug
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium">Sort by</h3>
              <div className="mt-3 space-y-1">
                {sortOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildHref({
                      sort: opt.value === "newest" ? undefined : opt.value,
                      page: undefined,
                    })}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      (params.sort ?? "newest") === opt.value
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {result.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Clear all filters</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
                {result.map((product) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={buildHref({
                          page: String(currentPage - 1),
                        })}
                      >
                        Previous
                      </Link>
                    </Button>
                  )}
                  <span className="px-3 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={buildHref({
                          page: String(currentPage + 1),
                        })}
                      >
                        Next
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
