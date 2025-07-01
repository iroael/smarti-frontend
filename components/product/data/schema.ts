import { z } from 'zod'

/* ================================
 * Tax / Pajak Schema
 * ================================ */
const taxSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  rate: z.number(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
})

/* ================================
 * Harga
 * ================================ */
const priceSchema = z.object({
  id: z.number(),
  dpp_beli: z.string().transform(Number),
  dpp_jual: z.string().transform(Number),
  h_jual_b: z.string().transform(Number),
  created_at: z.string(),
})

/* ================================
 * Supplier
 * ================================ */
const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  supplier_code: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  created_at: z.string(),
})

/* ================================
 * Produk Sederhana (untuk bundle item)
 * ================================ */
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
  tax: taxSchema.optional(),
})

/* ================================
 * Bundle Item
 * ================================ */
const bundleItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  product: simpleProductSchema,
})

/* ================================
 * Produk Lengkap
 * ================================ */
export const productSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  stock: z.number(),
  is_bundle: z.boolean(),
  inventory_type: z.enum(['stock', 'service', 'digital']),
  supplier: supplierSchema,
  tax: taxSchema.optional(),
  prices: z.array(priceSchema),
  bundleItems: z.array(bundleItemSchema).optional().default([]),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  dimension: z.string().nullable().optional(),
})

/* ================================
 * Product Form Schema
 * ================================ */
export const productFormSchema = z.object({
  product_code: z.string().min(1, 'Kode produk wajib diisi'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().nullable(),
  inventory_type: z.enum(['stock', 'service', 'digital']),
  stock: z.number().min(0, 'Stok tidak boleh negatif').optional(),
  is_bundle: z.boolean(),
  supplier_id: z.number().min(1, 'Supplier wajib dipilih'),
  tax_id: z.number().min(1, 'Pajak wajib dipilih').optional(),
  weight: z.number().min(0, 'Berat harus 0 atau lebih').optional(),
  length: z.number().min(0, 'Panjang harus 0 atau lebih').optional(),
  width: z.number().min(0, 'Tinggi harus 0 atau lebih').optional(),
  height: z.number().min(0, 'Tinggi harus 0 atau lebih').optional(),
  dimension: z.string().optional(),
  price: z.object({
    dpp_beli: z.number().min(0, 'DPP Beli harus 0 atau lebih'),
    dpp_jual: z.number().min(0, 'DPP Jual harus 0 atau lebih'),
    h_jual_b: z.number().min(0, 'Harga Jual harus 0 atau lebih'),
  }),
  bundleItems: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1, 'Quantity minimal 1'),
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.inventory_type !== 'stock' && (data.stock ?? 0) > 0) {
    ctx.addIssue({
      path: ['stock'],
      code: z.ZodIssueCode.custom,
      message: 'Stock harus 0 untuk tipe service atau digital',
    })
  }
})

/* ================================
 * List Response Schema
 * ================================ */
export const productListSchema = z.object({
  data: z.array(productSchema),
})

export const taxListSchema = z.object({
  data: z.array(taxSchema),
})

/* ================================
 * Types
 * ================================ */
export type Product = z.infer<typeof productSchema>
export type ProductForm = z.infer<typeof productFormSchema>
export type BundleItem = z.infer<typeof bundleItemSchema>
export type Tax = z.infer<typeof taxSchema>

/* ================================
 * Parse Helpers
 * ================================ */
export const parseProductList = (input: unknown): Product[] => {
  return productListSchema.parse(input).data
}

export const parseTaxList = (input: unknown): Tax[] => {
  return taxListSchema.parse(input).data
}

export const parseProduct = (input: unknown): Product => {
  return productSchema.parse(input)
}

export const parseTax = (input: unknown): Tax => {
  return taxSchema.parse(input)
}
