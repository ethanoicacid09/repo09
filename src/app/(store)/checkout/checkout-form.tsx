"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/stores/cart-store";
import { createCheckoutSession } from "./actions";
import { Loader2 } from "lucide-react";

export function CheckoutForm({ userEmail }: { userEmail: string }) {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createCheckoutSession({
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        email: userEmail,
        shipping: form,
      });
    });
  };

  if (items.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="mt-2 text-muted-foreground">
          Add some products before checking out
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* Shipping */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">Street address</Label>
          <Input
            id="street"
            required
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              required
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              required
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {item.name} × {item.quantity}
            </span>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{totalPrice() >= 2000 ? "Free" : "₹199"}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            ₹{(totalPrice() + (totalPrice() >= 2000 ? 0 : 199)).toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(totalPrice() + (totalPrice() >= 75 ? 0 : 9.99)).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}
