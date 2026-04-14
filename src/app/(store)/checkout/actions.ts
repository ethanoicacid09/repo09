"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

interface CheckoutInput {
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  email: string;
  shipping: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

export async function createCheckoutSession(input: CheckoutInput) {
  const subtotal = input.items.reduce(
    (t, i) => t + i.price * i.quantity,
    0
  );
  const shippingCost = subtotal >= 75 ? 0 : 999;

  const session = await stripe.checkout.sessions.create({
    line_items: input.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    ...(shippingCost > 0 && {
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount" as const,
            fixed_amount: { amount: shippingCost, currency: "usd" },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day" as const, value: 5 },
              maximum: { unit: "business_day" as const, value: 7 },
            },
          },
        },
      ],
    }),
    mode: "payment",
    customer_email: input.email,
    metadata: {
      shippingName: `${input.shipping.firstName} ${input.shipping.lastName}`,
      shippingStreet: input.shipping.street,
      shippingCity: input.shipping.city,
      shippingState: input.shipping.state,
      shippingPostalCode: input.shipping.postalCode,
      shippingCountry: input.shipping.country,
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
  });

  redirect(session.url!);
}
