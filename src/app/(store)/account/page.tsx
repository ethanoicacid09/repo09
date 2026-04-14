import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { Package, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  let orderCount = 0;
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, session.user.id!));
    orderCount = Number(result.count);
  } catch {}

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orderCount}</p>
            <Button variant="link" className="mt-2 h-auto p-0 text-sm" asChild>
              <Link href="/account/orders">View order history →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            <p className="text-sm">{session.user.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your shipping addresses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
