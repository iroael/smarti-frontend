
<script setup lang="ts">
import { computed } from 'vue'

interface Payment {
  id: string
  amount: number | string
  method: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transactionId: string
  paymentDate: string
  reference?: string
  fee?: number | string
  notes?: string
}

interface Props {
  payments: Payment[]
  orderTotal?: number | string
}

const props = defineProps<Props>()

// Calculate total paid amount
const totalPaid = computed(() => {
  if (!props.payments || props.payments.length === 0) return 0
  
  return props.payments
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount
      return total + amount
    }, 0)
})

// Calculate remaining amount
const remainingAmount = computed(() => {
  if (!props.orderTotal) return 0
  
  const orderTotalNum = typeof props.orderTotal === 'string' ? parseFloat(props.orderTotal) : props.orderTotal
  return Math.max(0, orderTotalNum - totalPaid.value)
})

// Format currency function
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numAmount)
}

// Format datetime function
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
  <div class="bg-white rounded-lg border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
    
    <div v-if="payments && payments.length > 0" class="space-y-4">
      <div v-for="payment in payments" :key="payment.id" class="border rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <span :class="[
              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800',
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
            ]">
              {{ capitalizeFirst(payment.status) }}
            </span>
            <span class="text-sm font-medium text-gray-900">{{ payment.method }}</span>
          </div>
          <span class="text-lg font-semibold text-gray-900">{{ formatCurrency(payment.amount) }}</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Transaction ID:</span>
            <span class="ml-2 font-medium text-gray-900">{{ payment.transactionId }}</span>
          </div>
          <div>
            <span class="text-gray-500">Payment Date:</span>
            <span class="ml-2 font-medium text-gray-900">{{ formatDateTime(payment.paymentDate) }}</span>
          </div>
          <div v-if="payment.reference">
            <span class="text-gray-500">Reference:</span>
            <span class="ml-2 font-medium text-gray-900">{{ payment.reference }}</span>
          </div>
          <div v-if="payment.fee">
            <span class="text-gray-500">Fee:</span>
            <span class="ml-2 font-medium text-gray-900">{{ formatCurrency(payment.fee) }}</span>
          </div>
        </div>
        
        <div v-if="payment.notes" class="mt-3 pt-3 border-t">
          <span class="text-sm text-gray-500">Notes:</span>
          <p class="mt-1 text-sm text-gray-900">{{ payment.notes }}</p>
        </div>
      </div>
      
      <!-- Payment Summary -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">Total Paid:</span>
          <span class="font-semibold text-gray-900">{{ formatCurrency(totalPaid) }}</span>
        </div>
        <div v-if="remainingAmount > 0" class="flex justify-between items-center text-sm mt-1">
          <span class="text-gray-500">Remaining:</span>
          <span class="font-semibold text-red-600">{{ formatCurrency(remainingAmount) }}</span>
        </div>
      </div>
    </div>
    
    <!-- No Payments State -->
    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No payments recorded</h3>
      <p class="mt-1 text-sm text-gray-500">Payment information will appear here once processed.</p>
    </div>
  </div>
</template>
