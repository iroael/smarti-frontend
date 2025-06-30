// types/shipping.ts
export type Order = {
  id: string
  orderNumber: string
  orderDate: string
  status: string
  customerId: number
  supplierId: number
  deliveryAddress: string
  subTotal: string
  shippingCost: string
  total: string
}

export type Delivery = {
  id: number
  courierName: string
  trackingNumber: string
  shippingStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  shippedAt: string
  deliveredAt: string
  createdAt: string
  order: Order
}
