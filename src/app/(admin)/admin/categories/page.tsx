import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { CategoryList } from "./category-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  let allCategories: (typeof categories.$inferSelect)[] = [];

  try {
    allCategories = await db.query.categories.findMany({
      orderBy: desc(categories.createdAt),
    });
  } catch {}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-muted-foreground">
          Organize your product catalog
        </p>
      </div>
      <CategoryList categories={allCategories} />
    </div>
  );
}
