// ~/schemas/supplier.ts
import { z } from 'zod'

// Bank Account Schema
export const bankAccountSchema = z.object({
  id: z.number(),
  ownerType: z.string(),
  ownerId: z.number(),
  bankName: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  branch: z.string(),
  isPrimary: z.boolean(),
  createdAt: z.string().datetime(), // ISO 8601 date string
})

// Tax Identification Schema
export const taxIdentificationSchema = z.object({
  id: z.number(),
  ownerType: z.string(),
  ownerId: z.number(),
  taxType: z.string(), // 'npwp', 'nib', etc.
  taxNumber: z.string(),
  taxName: z.string(),
  registeredAddress: z.string(),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
  createdAt: z.string().datetime(), // ISO 8601 date string
})

// Main Supplier Schema
export const supplierSchema = z.object({
  id: z.number(),
  supplier_code: z.string(),
  name: z.string(),
  kategori: z.string().nullable().optional(),
  npwp: z.string().nullable().optional(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postalcode: z.string().nullable().optional(),
  accurate_id: z.string().nullable().optional(),
  accurate_sc: z.string().nullable().optional(),
  xendit_id: z.string().nullable().optional(),
  xendit_sc: z.string().nullable().optional(),
  astat: z.boolean().nullable().optional(),
  xstat: z.boolean().nullable().optional(),
  created_at: z.string().datetime(), // ISO 8601 date string
  bankAccounts: z.array(bankAccountSchema).optional(),
  taxIdentifications: z.array(taxIdentificationSchema).optional(),
})

// Response Schema
export const suppliersResponseSchema = z.object({
  data: z.array(supplierSchema),
})

// Inferred Types
export type BankAccount = z.infer<typeof bankAccountSchema>
export type TaxIdentification = z.infer<typeof taxIdentificationSchema>
export type Supplier = z.infer<typeof supplierSchema>
export type SuppliersResponse = z.infer<typeof suppliersResponseSchema>
