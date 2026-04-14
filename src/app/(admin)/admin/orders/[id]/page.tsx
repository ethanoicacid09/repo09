import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { OrderStatusControl } from "./order-status-control";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail — Admin" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  let order;
  try {
    order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: { with: { product: true } },
        user: { columns: { name: true, email: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!order) notFound();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleDateString()} by{" "}
            {order.user?.name ?? order.user?.email ?? "Unknown"}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`text-sm px-3 py-1 ${statusColors[order.status] ?? ""}`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="border-b bg-muted/50 px-4 py-3">
              <h2 className="text-sm font-semibold">
                Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.product?.name ?? item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ₹
                    {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t bg-muted/50 px-4 py-3 flex justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-bold">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <OrderStatusControl orderId={order.id} currentStatus={order.status} />

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Customer</h3>
            <div className="text-sm">
              <p className="font-medium">{order.user?.name ?? "—"}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
            </div>
          </div>

          {order.shippingName && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">Shipping Address</h3>
              <div className="text-sm text-muted-foreground">
                <p>{order.shippingName}</p>
                <p>{order.shippingStreet}</p>
                <p>
                  {order.shippingCity}, {order.shippingState}{" "}
                  {order.shippingPostalCode}
                </p>
                <p>{order.shippingCountry}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
