// composables/schemas/order.ts
import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  stock: z.number(),
  isBundle: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const orderItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  price: z.string(),
  product: productSchema
})

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  phone: z.string(),
  npwp: z.string(),
  address: z.string(),
  createdAt: z.string()
})

export const orderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  orderDate: z.string(),
  status: z.string(),
  total: z.string(),
  customer: customerSchema,
  items: z.array(orderItemSchema)
})

export const ordersResponseSchema = z.object({
  data: z.array(orderSchema)
})

export type Order = z.infer<typeof orderSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
