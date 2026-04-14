import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order History" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account/orders");

  let userOrders: (typeof orders.$inferSelect)[] = [];
  try {
    userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, session.user.id!))
      .orderBy(desc(orders.createdAt));
  } catch {}

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
      <p className="mt-2 text-muted-foreground">
        Track and manage your orders
      </p>

      {userOrders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Package className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">
            When you place your first order, it will appear here.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {userOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 sm:p-6"
            >
              <div className="space-y-1">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <Badge
                  variant="secondary"
                  className={statusColors[order.status] ?? ""}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">₹{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
