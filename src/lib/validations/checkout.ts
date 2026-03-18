import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2).max(2, "Use ISO country code"),
  phone: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(), // If empty, use shipping
  shippingRateId: z.string().optional(),
  discountCode: z.string().optional(),
  note: z.string().optional(),
  locale: z.enum(["pk", "ae", "us"]).default("pk"),
  currency: z.string().default("PKR"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
