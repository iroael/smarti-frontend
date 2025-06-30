// composables/useOrderCalculations.ts
import type { Ref } from 'vue'
import type { Order } from '@/components/orders/data/schema'

export const useOrderCalculations = (order: Ref<Order | null>) => {
  const calculateItemTotal = (item: any) => {
    const itemTotal = parseFloat(item.price) * item.quantity
    const taxTotal = item.taxes ? item.taxes.reduce((sum: number, tax: any) => sum + parseFloat(tax.taxAmount), 0) : 0
    return itemTotal + taxTotal
  }

  const calculateTotalTax = () => {
    if (!order.value) return 0
    return order.value.items.reduce((total, item) => {
      const itemTax = item.taxes ? item.taxes.reduce((sum: number, tax: any) => sum + parseFloat(tax.taxAmount), 0) : 0
      return total + itemTax
    }, 0)
  }

  const calculateGrandTotal = () => {
    if (!order.value) return 0
    return parseFloat(order.value.total) + parseFloat(order.value.shippingCost || '0')
  }

  return {
    calculateItemTotal,
    calculateTotalTax,
    calculateGrandTotal
  }
}