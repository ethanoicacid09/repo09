"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { orders, orderItems, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const subtotal = input.items.reduce(
    (t, i) => t + i.price * i.quantity,
    0
  );
  const shippingCost = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shippingCost;

  const orderNumber = `ZH-${Date.now().toString(36).toUpperCase()}`;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) throw new Error("User not found");

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: user.id,
      status: "processing",
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      total: total.toFixed(2),
      shippingName: `${input.shipping.firstName} ${input.shipping.lastName}`,
      shippingStreet: input.shipping.street,
      shippingCity: input.shipping.city,
      shippingState: input.shipping.state,
      shippingPostalCode: input.shipping.postalCode,
      shippingCountry: input.shipping.country,
      shippingPhone: input.shipping.phone,
    })
    .returning();

  if (input.items.length > 0) {
    await db.insert(orderItems).values(
      input.items.map((item) => ({
        orderId: order.id,
        productId: user.id, // placeholder
        name: item.name,
        price: item.price.toFixed(2),
        quantity: item.quantity,
      }))
    );
  }

  redirect("/checkout/success");
}
