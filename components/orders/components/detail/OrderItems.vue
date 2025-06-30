<script setup lang="ts">
interface Product {
  id: number
  product_code: string
  name: string
  description?: string
  is_bundle: boolean
  inventory_type: string
}

interface Tax {
  id: number
  taxRate: string
  taxAmount: string
  tax: {
    id: number
    name: string
    rate: string
  }
}

interface OrderItem {
  id: number
  orderId: string
  quantity: number
  price: string
  product: Product
  taxes?: Tax[]
}

interface Props {
  items: OrderItem[]
  total: string | number
  shippingCost?: string | number
  grandTotal: string | number
  calculateItemTotal: (item: OrderItem) => number
}

const props = defineProps<Props>()

// Format currency
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numAmount)
}

// Calculate subtotal (without tax and shipping)
const subtotal = computed(() => {
  return props.items.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) * item.quantity
    return sum + itemPrice
  }, 0)
})

// Calculate total tax
const totalTax = computed(() => {
  return props.items.reduce((sum, item) => {
    if (item.taxes && item.taxes.length > 0) {
      const itemTax = item.taxes.reduce((taxSum, tax) => {
        return taxSum + parseFloat(tax.taxAmount)
      }, 0)
      return sum + itemTax
    }
    return sum
  }, 0)
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">
        <svg class="inline-block w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        Order Items
      </h3>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div>
                <div class="font-medium text-gray-900">{{ item.product.name }}</div>
                <div class="text-sm text-gray-500 mt-1">{{ item.product.product_code }}</div>
                <div v-if="item.product.description" class="text-xs text-gray-400 mt-1">
                  {{ item.product.description }}
                </div>
                <div v-if="item.product.is_bundle" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  Bundle Product
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-center text-sm text-gray-900 font-medium">
              {{ item.quantity }}
            </td>
            <td class="px-6 py-4 text-right text-sm text-gray-900">
              {{ formatCurrency(item.price) }}
            </td>
            <td class="px-6 py-4 text-right text-sm text-gray-900">
              <div v-if="item.taxes && item.taxes.length > 0">
                <div v-for="tax in item.taxes" :key="tax.id" class="text-xs">
                  {{ tax.tax.name }}: {{ formatCurrency(tax.taxAmount) }}
                </div>
              </div>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
              {{ formatCurrency(calculateItemTotal(item)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Order Summary -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Subtotal</span>
          <span class="text-gray-900">{{ formatCurrency(subtotal) }}</span>
        </div>
        
        <div v-if="totalTax > 0" class="flex justify-between">
          <span class="text-gray-600">Tax</span>
          <span class="text-gray-900">{{ formatCurrency(totalTax) }}</span>
        </div>
        
        <div v-if="shippingCost && parseFloat(shippingCost) > 0" class="flex justify-between">
          <span class="text-gray-600">Shipping Cost</span>
          <span class="text-gray-900">{{ formatCurrency(shippingCost) }}</span>
        </div>
        
        <hr class="border-gray-200">
        <div class="flex justify-between font-semibold text-base">
          <span class="text-gray-900">Grand Total</span>
          <span class="text-gray-900">{{ formatCurrency(grandTotal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
