import { db } from "@/lib/db";
import { products, orders, users } from "@/lib/schema";
import { sql, eq, desc } from "drizzle-orm";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default async function AdminDashboardPage() {
  let stats = { revenue: 0, orderCount: 0, productCount: 0, customerCount: 0 };
  let recentOrders: (typeof orders.$inferSelect)[] = [];

  try {
    const [revenueResult] = await db
      .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
      .from(orders);
    const [orderCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const [productCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);
    const [customerCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));

    stats = {
      revenue: parseFloat(revenueResult.total),
      orderCount: Number(orderCountResult.count),
      productCount: Number(productCountResult.count),
      customerCount: Number(customerCountResult.count),
    };

    recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);
  } catch {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description="Lifetime earnings"
          icon={DollarSign}
        />
        <StatsCard
          title="Orders"
          value={stats.orderCount}
          description="Total orders placed"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Products"
          value={stats.productCount}
          description="Active in catalog"
          icon={Package}
        />
        <StatsCard
          title="Customers"
          value={stats.customerCount}
          description="Registered users"
          icon={Users}
        />
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status] ?? ""}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      ${order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
