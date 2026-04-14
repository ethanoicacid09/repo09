"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/stores/cart-store";
import { useState, useEffect } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <div className="mt-8 animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="space-y-1">
              {items.map((item, index) => (
                <div key={item.productId}>
                  <div className="flex gap-4 py-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator />}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems()} items)
                  </span>
                  <span>${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {totalPrice() >= 75 ? (
                      <span className="text-primary">Free</span>
                    ) : (
                      "$9.99"
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    $
                    {(
                      totalPrice() + (totalPrice() >= 75 ? 0 : 9.99)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              {totalPrice() < 75 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Add ${(75 - totalPrice()).toFixed(2)} more for free shipping
                </p>
              )}
              <Button className="mt-6 w-full" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
