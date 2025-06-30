import { z } from 'zod'

export const taxSchema = z.object({
  id: z.number(),
  name: z.string(), // e.g., "PPN 11%"
  rate: z.string().or(z.number()), // e.g., 11.00 as string or number (based on API output)
  description: z.string().nullable(), // nullable sesuai entitas
  is_active: z.boolean(),
  created_at: z.string(), // ISO string dari Date
})

export type Tax = z.infer<typeof taxSchema>
