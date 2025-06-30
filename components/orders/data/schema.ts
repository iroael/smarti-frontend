import { z } from 'zod'

/** 🔧 Helper untuk parsing string/number ke number */
const numberOrStringToNumber = () =>
  z.preprocess((val) => (typeof val === 'string' ? Number(val) : val), z.number())

/** 📦 Tax Detail Schema */
const taxDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  rate: numberOrStringToNumber(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
})

/** 📦 Tax Entry Schema */
const taxEntrySchema = z.object({
  id: z.number(),
  taxRate: numberOrStringToNumber(),
  taxAmount: numberOrStringToNumber(),
  tax: taxDetailSchema,
})

/** 🏢 Supplier Schema */
export const supplierSchema = z.object({
  id: z.number(),
  supplier_code: z.string().optional(),
  kategori: z.string().optional(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  npwp: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalcode: z.string().nullable().optional(),
  created_at: z.string(),
})

/** 💰 Product Price Schema */
export const priceSchema = z.object({
  id: z.number(),
  dpp_beli: z.string(),
  dpp_jual: z.string(),
  h_jual_b: z.string(),
  created_at: z.string(),
})

/** 📦 Product Schema */
export const productSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string(),
  stock: z.number().optional(),
  is_bundle: z.boolean(),
  inventory_type: z.string().optional(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().nullable().optional(),
  created_at: z.string(),
  supplier: supplierSchema.nullable(),
  prices: z.array(priceSchema),
  productTaxes: z.array(z.unknown()).optional(), // Update jika strukturnya sudah pasti
})

/** 🛒 Order Item Schema */
export const orderItemSchema = z.object({
  id: z.number(),
  quantity: numberOrStringToNumber(),
  price: numberOrStringToNumber(),
  sourceBundleCode: z.string().nullable().optional(),
  product: productSchema,
  taxes: z.array(taxEntrySchema).optional(),
})

/** 👥 Customer Schema */
export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  npwp: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalcode: z.string().nullable().optional(),
  address: z.string(),
  createdAt: z.string().nullable().optional(),
})

// Main shipping schema
export const deliverySchema = z.object({
  id: z.number(),
  courierName: z.string(),
  trackingNumber: z.string(),
  shippingStatus: z.string(),
  shippedAt: z.string(),
  deliveredAt: z.string().nullable().optional(),
  createdAt: z.string(),
})

/** 📑 Order Schema */
export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.number().optional(),
  supplierId: z.number().optional(),
  orderDate: z.string(),
  status: z.string(),
  total: z.string(),
  notes: z.string().nullable().optional(),
  snapToken: z.string().nullable().optional(),
  snapTokenExpiredAt: z.string().nullable().optional(),
  deliveryAddress: z.union([numberOrStringToNumber(), z.string(), z.null()]).optional(),
  shippingCost: z.string().optional(),
  customer: customerSchema.nullable().optional(),
  supplier: supplierSchema.nullable().optional(),
  items: z.array(orderItemSchema),
  shippings: z.array(deliverySchema).nullable().optional(),
})

/** 📦 Response tanpa pagination (me, incoming) */
export const ordersResponseSchema = z.object({
  data: z.array(orderSchema),
})

/** 📦 Response dengan pagination (all) */
export const paginatedOrdersResponseSchema = z.object({
  data: z.array(orderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

/** 🔥 Types */
export type Supplier = z.infer<typeof supplierSchema>
export type Price = z.infer<typeof priceSchema>
export type Product = z.infer<typeof productSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Customer = z.infer<typeof customerSchema>
export type Delivery = z.infer<typeof deliverySchema>
export type Order = z.infer<typeof orderSchema>
