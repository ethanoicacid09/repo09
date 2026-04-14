"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/hash";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Check if user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const hashedPassword = await hashPassword(input.password);

    await db.insert(users).values({
      name: input.name,
      email: input.email,
      hashedPassword,
      role: "customer",
    });

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
