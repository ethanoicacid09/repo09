import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { ProductForm } from "../product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  let allCategories: { id: string; name: string }[] = [];
  try {
    allCategories = await db.query.categories.findMany({
      columns: { id: true, name: true },
    });
  } catch {}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
        <p className="mt-1 text-muted-foreground">
          Add a new product to your catalog
        </p>
      </div>
      <ProductForm categories={allCategories} />
    </div>
  );
}
