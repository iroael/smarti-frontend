import { z } from 'zod'

// Harga
const priceSchema = z.object({
  id: z.number(),
  dpp_beli: z.string().transform(Number),
  dpp_jual: z.string().transform(Number),
  h_jual_b: z.string().transform(Number),
  created_at: z.string(),
})

// Supplier
const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  supplier_code: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  created_at: z.string(),
})

// Produk sederhana (untuk bundleItems)
const simpleProductSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  stock: z.number(),
  is_bundle: z.boolean(),
  created_at: z.string(),
  prices: z.array(priceSchema),
  supplier: supplierSchema,
})

// Item di dalam bundle
const bundleItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  product: simpleProductSchema,
})

// Produk lengkap
export const productSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  stock: z.number(),
  is_bundle: z.boolean(),
  inventory_type: z.string(),
  created_at: z.string(),
  supplier: supplierSchema,
  prices: z.array(priceSchema),
  bundleItems: z.array(bundleItemSchema).optional().default([]),
})

// List response
export const productListSchema = z.object({
  data: z.array(productSchema),
})

// Type exports
export type Product = z.infer<typeof productSchema>
export type BundleItem = z.infer<typeof bundleItemSchema>

// Optional parse helper
export const parseProductList = (input: unknown): Product[] => {
  return productListSchema.parse(input).data
}
