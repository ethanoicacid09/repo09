"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status" };
  }

  try {
    await db
      .update(orders)
      .set({ status: status as "pending" | "processing" | "shipped" | "delivered" | "cancelled", updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    return { success: true };
  } catch {
    return { error: "Failed to update order status" };
  }
}
