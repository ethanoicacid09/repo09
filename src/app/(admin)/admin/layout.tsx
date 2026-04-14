import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/shared/auth-provider";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  if ((session.user as { role?: string }).role !== "admin") {
    redirect("/");
  }

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
