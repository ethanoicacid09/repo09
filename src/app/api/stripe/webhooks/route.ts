import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { users } from "@/lib/schema";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Look up the user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.customer_email!))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `VRD-${Date.now().toString(36).toUpperCase()}`;

    // Get line items from Stripe
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const total = (session.amount_total ?? 0) / 100;
    const subtotal = (session.amount_subtotal ?? 0) / 100;
    const shipping = total - subtotal;

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: user.id,
        status: "processing",
        subtotal: subtotal.toFixed(2),
        shippingCost: shipping.toFixed(2),
        total: total.toFixed(2),
        shippingName: session.metadata?.shippingName,
        shippingStreet: session.metadata?.shippingStreet,
        shippingCity: session.metadata?.shippingCity,
        shippingState: session.metadata?.shippingState,
        shippingPostalCode: session.metadata?.shippingPostalCode,
        shippingCountry: session.metadata?.shippingCountry,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
      })
      .returning();

    // Create order items
    if (lineItems.data.length > 0) {
      await db.insert(orderItems).values(
        lineItems.data.map((item) => ({
          orderId: order.id,
          productId: user.id, // placeholder — in production, map from Stripe product metadata
          name: item.description ?? "Product",
          price: ((item.amount_total ?? 0) / 100 / (item.quantity ?? 1)).toFixed(2),
          quantity: item.quantity ?? 1,
        }))
      );
    }
  }

  return NextResponse.json({ received: true });
}
