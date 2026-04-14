import { auth } from "@/auth";
import { NextResponse } from "next/server";

const adminPaths = ["/admin"];
const authPaths = ["/account", "/checkout"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  // Redirect unauthenticated users to sign-in
  if (!isLoggedIn) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  // Block non-admin users from admin routes
  if (adminPaths.some((p) => pathname.startsWith(p)) && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
