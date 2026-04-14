"use server";

import { db } from "@/lib/db";
import { products, productImages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface SaveProductInput {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
}

export async function saveProduct(input: SaveProductInput) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const slug = slugify(input.name);
    const data = {
      name: input.name,
      slug: input.id ? undefined : slug,
      description: input.description || null,
      categoryId: input.categoryId,
      price: input.price,
      compareAtPrice: input.compareAtPrice || null,
      sku: input.sku || null,
      stock: input.stock,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      updatedAt: new Date(),
    };

    if (input.id) {
      // Update
      const { slug: _, ...updateData } = data;
      await db.update(products).set(updateData).where(eq(products.id, input.id));

      // Update images
      await db.delete(productImages).where(eq(productImages.productId, input.id));
      if (input.imageUrl) {
        await db.insert(productImages).values({
          productId: input.id,
          url: input.imageUrl,
          alt: input.name,
          displayOrder: 0,
        });
      }
    } else {
      // Create
      const [product] = await db
        .insert(products)
        .values({ ...data, slug })
        .returning();

      if (input.imageUrl) {
        await db.insert(productImages).values({
          productId: product.id,
          url: input.imageUrl,
          alt: input.name,
          displayOrder: 0,
        });
      }
    }

    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to save product";
    return { error: message };
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(productImages).where(eq(productImages.productId, id));
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  } catch {
    return { error: "Failed to delete product" };
  }
}
