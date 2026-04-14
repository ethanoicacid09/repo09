import { db } from "@/lib/db";
import { products, categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "../../product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product — Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  let product;
  let allCategories: { id: string; name: string }[] = [];

  try {
    product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { images: true },
    });
    allCategories = await db.query.categories.findMany({
      columns: { id: true, name: true },
    });
  } catch {
    notFound();
  }

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="mt-1 text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm
        categories={allCategories}
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          categoryId: product.categoryId,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? "",
          sku: product.sku ?? "",
          stock: product.stock,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images.map((img) => img.url),
        }}
      />
    </div>
  );
}
