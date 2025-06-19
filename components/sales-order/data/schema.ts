import { z } from 'zod'

// Supplier Schema
export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  created_at: z.string()
})

// Product Price Schema
export const priceSchema = z.object({
  id: z.number(),
  dpp_beli: z.string(),
  dpp_jual: z.string(),
  h_jual_b: z.string(),
  created_at: z.string()
})

// Product Schema (matches response API exactly)
export const productSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string(),
  stock: z.number(),
  is_bundle: z.boolean(),
  created_at: z.string(),
  supplier: supplierSchema,
  prices: z.array(priceSchema)
})

// Order Item Schema
export const orderItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  price: z.string(),
  product: productSchema
})

// Customer Schema
export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  npwp: z.string(),
  province: z.string(),
  city: z.string(),
  postalcode: z.string(),
  address: z.string(),
  createdAt: z.string()
})

// Order Schema
export const orderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  orderDate: z.string(),
  status: z.string(),
  total: z.string(),
  customer: customerSchema,
  items: z.array(orderItemSchema)
})

// Response Wrapper
export const ordersResponseSchema = z.object({
  data: z.array(orderSchema)
})

// Types
export type Supplier = z.infer<typeof supplierSchema>
export type Price = z.infer<typeof priceSchema>
export type Product = z.infer<typeof productSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Customer = z.infer<typeof customerSchema>
export type Order = z.infer<typeof orderSchema>
