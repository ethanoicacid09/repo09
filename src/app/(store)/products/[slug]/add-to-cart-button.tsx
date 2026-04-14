"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/lib/stores/cart-store";
import { toast } from "sonner";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
}

export function AddToCartButton({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    const item: Omit<CartItem, "id"> = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      slug: product.slug,
    };
    addItem(item);
    toast.success(`${product.name} added to cart`);
    setQuantity(1);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Quantity */}
      <div className="flex items-center rounded-lg border">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          disabled={quantity >= product.stock}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button
        size="lg"
        className="flex-1 gap-2"
        onClick={handleAdd}
        disabled={product.stock <= 0}
      >
        <ShoppingBag className="h-4 w-4" />
        {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
