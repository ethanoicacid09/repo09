"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveCategory, deleteCategory } from "./actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openNewDialog = () => {
    setEditingCategory(null);
    setIsOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "New Category"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onDone={() => {
                setIsOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No categories yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={() => openEditDialog(cat)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CategoryCard({
  category,
  onEdit,
}: {
  category: Category;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete "${category.name}"?`)) return;
    startDeleteTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {category.image && (
        <img
          src={category.image}
          alt={category.name}
          className="h-32 w-full object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold">{category.name}</h3>
        {category.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  onDone,
}: {
  category: Category | null;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveCategory({
        id: category?.id,
        name,
        description,
        image,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(category ? "Category updated" : "Category created");
        onDone();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-desc">Description</Label>
        <Input
          id="cat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-img">Image URL</Label>
        <Input
          id="cat-img"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {category ? "Update" : "Create"} Category
      </Button>
    </form>
  );
}
