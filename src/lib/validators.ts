import { z } from "zod/v4";

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Please select a category"),
  price: z.string().regex(/^\d+\.?\d{0,2}$/, "Invalid price"),
  compareAtPrice: z
    .string()
    .regex(/^\d+\.?\d{0,2}$/, "Invalid price")
    .optional()
    .or(z.literal("")),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AddressInput = z.infer<typeof addressSchema>;
