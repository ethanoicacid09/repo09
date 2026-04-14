"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, type CartItem } from "@/lib/stores/cart-store";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice?: string | null;
  image: string;
  category?: string;
  stock: number;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  category,
  stock,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const numPrice = parseFloat(price);
  const numCompare = compareAtPrice ? parseFloat(compareAtPrice) : null;
  const onSale = numCompare && numCompare > numPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock <= 0) return;
    const item: Omit<CartItem, "id"> = {
      productId: id,
      name,
      price: numPrice,
      image,
      quantity: 1,
      slug,
    };
    addItem(item);
    toast.success(`${name} added to cart`);
  };

  return (
    <div className="group relative">
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {onSale && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              Sale
            </Badge>
          )}
          {stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Badge variant="secondary">Out of stock</Badge>
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          {category && (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
          )}
          <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">${numPrice.toFixed(2)}</p>
            {onSale && (
              <p className="text-xs text-muted-foreground line-through">
                ${numCompare.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </Link>
      <Button
        size="sm"
        variant="secondary"
        className="mt-2 w-full gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        onClick={handleAddToCart}
        disabled={stock <= 0}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Add to Cart
      </Button>
    </div>
  );
}
