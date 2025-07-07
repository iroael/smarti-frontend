import { z } from 'zod'

// Bank Account Schema
export const bankAccountSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  branch: z.string(),
  isPrimary: z.boolean(),
  createdAt: z.string().datetime().optional(), // ISO 8601 date string
})

// Tax Identification Schema
export const taxSchema = z.object({
  taxType: z.string(), // 'npwp', 'nib', etc.
  taxNumber: z.string(),
  taxName: z.string(),
  registeredAddress: z.string(),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
})

export const customerAddressSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  postalcode: z.string(),
  is_default: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
})

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  customer_code: z.string().nullable().optional(),
  email: z.string().email(),
  phone: z.string(),
  npwp: z.string(),
  city: z.string(),
  province: z.string(),
  postalcode: z.string(),
  createdAt: z.string().datetime(),
})

export const formCustomerSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  customer_code: z.string().nullable().optional(),
  email: z.string().email(),
  password: z.string().optional(), // tambahkan ini
  phone: z.string(),
  address: z.string(), // tambahkan ini
  city: z.string(),
  province: z.string(),
  postalcode: z.string(),
  createdAt: z.string().datetime().optional(),

  bankAccounts: z.array(bankAccountSchema).optional(),
  tax: z.array(taxSchema).optional(), // tax hanya 1 object, bukan array
  addresses: z.union([
    z.array(customerAddressSchema),
    customerAddressSchema,
  ]).optional(),
})

export const customerListSchema = z.object({
  data: z.array(customerSchema),
})

export type Customer = z.infer<typeof customerSchema>
export type CustomerForm = z.infer<typeof formCustomerSchema>
export type CustomerList = z.infer<typeof customerListSchema>
