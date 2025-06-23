import { z } from 'zod'

// Preprocessor helper
const numberOrStringToNumber = () =>
  z.preprocess((val) => typeof val === 'string' ? Number(val) : val, z.number())

// Tax Detail Schema
const taxDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  rate: z.string(), // Bisa diganti number jika perlu
})

// Tax Entry Schema
const taxEntrySchema = z.object({
  id: z.number(),
  taxRate: numberOrStringToNumber(),
  taxAmount: numberOrStringToNumber(),
  tax: taxDetailSchema,
})

// Supplier Schema
export const supplierSchema = z.object({
  id: z.number(),
  supplier_code: z.string().optional(),
  kategori: z.string().optional(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  created_at: z.string(),
})

// Product Price Schema
export const priceSchema = z.object({
  id: z.number(),
  dpp_beli: z.string(),
  dpp_jual: z.string(),
  h_jual_b: z.string(),
  created_at: z.string(),
})

// Product Schema
export const productSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string(),
  stock: z.number(),
  is_bundle: z.boolean(),
  created_at: z.string(),
  supplier: supplierSchema.nullable(), // 🔧 Supplier bisa null
  prices: z.array(priceSchema),
})

// Order Item Schema
export const orderItemSchema = z.object({
  id: z.number(),
  quantity: numberOrStringToNumber(),
  price: z.string(),
  product: productSchema,
  taxes: z.array(taxEntrySchema).optional(),
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
  createdAt: z.string(),
})

// Order Schema
export const orderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  orderDate: z.string(),
  status: z.string(),
  total: z.string(),
  notes: z.string().optional(),
  deliveryAddress: z.union([numberOrStringToNumber(), z.null()]), // ✅ Null support
  shippingCost: z.string().optional(),
  customer: customerSchema.nullable(), // ✅ Null support
  supplier: supplierSchema.nullable().optional(), // ✅ Null support
  items: z.array(orderItemSchema),
})

// Response Wrapper
export const ordersResponseSchema = z.object({
  data: z.array(orderSchema),
})

// Types
export type Supplier = z.infer<typeof supplierSchema>
export type Price = z.infer<typeof priceSchema>
export type Product = z.infer<typeof productSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Customer = z.infer<typeof customerSchema>
export type Order = z.infer<typeof orderSchema>
