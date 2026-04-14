import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-primary" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Thank you for your order!
      </h1>
      <p className="mt-4 text-muted-foreground">
        Your order has been confirmed and will be shipped soon. We&apos;ll send
        you an email with your tracking details.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/account/orders">View Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
