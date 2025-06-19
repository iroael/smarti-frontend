import { z } from 'zod'

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  npwp: z.string(),
  city: z.string(),
  province: z.string(),
  postalcode: z.string(),
  createdAt: z.string().datetime(),
})

export const customerListSchema = z.object({
  data: z.array(customerSchema),
})

export type Customer = z.infer<typeof customerSchema>
export type CustomerList = z.infer<typeof customerListSchema>
