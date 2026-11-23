import { z } from "zod"

export const customerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  firstName: z.string().trim().min(1, "Enter your first name").max(80),
  lastName: z.string().trim().min(1, "Enter your last name").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address1: z.string().trim().min(2, "Enter your street address").max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\d{5}$/, "Enter a 5-digit Swedish postal code")),
  city: z.string().trim().min(1, "Enter your city").max(100),
})

export const checkoutSchema = z.object({
  orderId: z.uuid().optional().nullable(),
  items: z
    .array(z.object({ productId: z.uuid(), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Your bag is empty")
    .max(50),
  customer: customerSchema,
})

export type Customer = z.infer<typeof customerSchema>
export type CheckoutRequest = z.infer<typeof checkoutSchema>

export type CheckoutResponse =
  | { ok: true; orderId: string; clientSecret: string; totals: { subtotal: number; shipping: number; total: number; vat: number } }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; stock?: { productId: string; available: number }[] }
