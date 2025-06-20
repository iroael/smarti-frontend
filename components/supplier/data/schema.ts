// ~/schemas/supplier.ts
import { z } from 'zod'

export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  created_at: z.string().datetime(), // ISO 8601 date string
})

export const suppliersResponseSchema = z.object({
  data: z.array(supplierSchema),
})

export type Supplier = z.infer<typeof supplierSchema>
