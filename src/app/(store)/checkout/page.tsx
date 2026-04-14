import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "./checkout-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Complete your order details below
      </p>
      <CheckoutForm userEmail={session.user.email!} />
    </div>
  );
}
