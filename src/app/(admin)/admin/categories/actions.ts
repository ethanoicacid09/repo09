"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
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

export async function saveCategory(input: {
  id?: string;
  name: string;
  description: string;
  image: string;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    if (input.id) {
      await db
        .update(categories)
        .set({
          name: input.name,
          description: input.description || null,
          image: input.image || null,
        })
        .where(eq(categories.id, input.id));
    } else {
      await db.insert(categories).values({
        name: input.name,
        slug: slugify(input.name),
        description: input.description || null,
        image: input.image || null,
      });
    }
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to save category";
    return { error: message };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch {
    return { error: "Failed to delete category. It may have products assigned." };
  }
}
