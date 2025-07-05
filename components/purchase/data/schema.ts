import { z } from 'zod';

// Schema untuk Supplier (disederhanakan)
const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Schema untuk Address (disederhanakan)
const addressSchema = z.object({
  id: z.number(),
  street: z.string(),
})

// Schema untuk PurchaseOrderItem
const purchaseOrderItemSchema = z.object({
  id: z.number(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
})

// Enum untuk PurchaseOrderStatus
const purchaseOrderStatusEnum = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled',
])

// Schema utama untuk PurchaseOrder
export const purchaseOrderSchema = z.object({
  id: z.number(),
  poNumber: z.string(),
  orderDate: z.date().or(z.string()), // Menerima Date object atau string ISO
  status: purchaseOrderStatusEnum,
  supplier: supplierSchema,
  address: addressSchema,
  notes: z.string().optional().nullable(),
  subtotal: z.number(),
  taxTotal: z.number(),
  shippingCost: z.number(),
  total: z.number(),
  createdAt: z.date().or(z.string()), // Menerima Date object atau string ISO
  items: z.array(purchaseOrderItemSchema),
})

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>

// Schema untuk array of PurchaseOrders
export const purchaseOrdersSchema = z.array(purchaseOrderSchema)

// Schema untuk response API (sesuai dengan format dummy data Anda)
export const purchaseOrdersResponseSchema = z.object({
  data: purchaseOrdersSchema,
})

export type PurchaseOrdersResponse = z.infer<typeof purchaseOrdersResponseSchema>
