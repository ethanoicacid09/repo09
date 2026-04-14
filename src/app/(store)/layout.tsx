import { AuthProvider } from "@/components/shared/auth-provider";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </AuthProvider>
  );
}
