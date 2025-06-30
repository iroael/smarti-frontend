import { z } from 'zod'

// Tax schema
const taxSchema = z.object({
  id: z.number(),
  name: z.string(),
  rate: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
})

// Tax item schema
const taxItemSchema = z.object({
  id: z.number(),
  taxRate: z.string(),
  taxAmount: z.string(),
  tax: taxSchema,
})

// Price schema
const priceSchema = z.object({
  id: z.number(),
  dpp_beli: z.string(),
  dpp_jual: z.string(),
  h_jual_b: z.string(),
  created_at: z.string(),
})

// Supplier schema
const supplierSchema = z.object({
  id: z.number(),
  supplier_code: z.string(),
  kategori: z.string(),
  npwp: z.string().nullable(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  province: z.string().nullable(),
  city: z.string().nullable(),
  postalcode: z.string().nullable(),
  created_at: z.string(),
})

// Product schema
const productSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string(),
  stock: z.number(),
  is_bundle: z.boolean(),
  inventory_type: z.string(),
  is_deleted: z.boolean(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  supplier: supplierSchema,
  prices: z.array(priceSchema),
  productTaxes: z.array(z.unknown()), // Empty array in your data
})

// Order item schema
const orderItemSchema = z.object({
  id: z.number(),
  orderId: z.string(),
  quantity: z.number(),
  price: z.string(),
  sourceBundleCode: z.string().nullable(),
  product: productSchema,
  taxes: z.array(taxItemSchema),
})

// Customer schema
const customerSchema = z.object({
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

// Order schema
const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.number(),
  supplierId: z.number(),
  orderDate: z.string(),
  status: z.string(),
  notes: z.string(),
  deliveryAddress: z.string(),
  subTotal: z.string(),
  shippingCost: z.string(),
  total: z.string(),
  snapToken: z.string().nullable(),
  parentOrderId: z.string().nullable(),
  customer: customerSchema,
  supplier: supplierSchema,
  items: z.array(orderItemSchema),
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
  order: orderSchema,
})

// Response schema
export const deliveryResponseSchema = z.object({
  data: z.array(deliverySchema),
})

// Type exports
export type Tax = z.infer<typeof taxSchema>
export type TaxItem = z.infer<typeof taxItemSchema>
export type Price = z.infer<typeof priceSchema>
export type Supplier = z.infer<typeof supplierSchema>
export type Product = z.infer<typeof productSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Customer = z.infer<typeof customerSchema>
export type Order = z.infer<typeof orderSchema>
export type Delivery = z.infer<typeof deliverySchema>
export type DeliveryResponse = z.infer<typeof deliveryResponseSchema>
