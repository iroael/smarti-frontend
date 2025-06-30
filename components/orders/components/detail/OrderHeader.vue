<script setup lang="ts">
import type { Order } from '@/components/orders/data/schema'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

interface Props {
  order: Order
  grandTotal: number | string
}

interface Emits {
  (e: 'go-back'): void
  (e: 'edit-order'): void
  (e: 'cancel-order'): void
  (e: 'process-payment'): void
  (e: 'ship-order'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { user } = useAuthStore()

const isSupplier = computed(() => user.role === 'supplier')
const isCustomer = computed(() => user.role === 'customer')

const canCancel = computed(() =>
  ['pending', 'awaiting_payment'].includes(props.order.status) && isCustomer.value,
)

const canProcessPayment = computed(() =>
  ['pending', 'awaiting_payment'].includes(props.order.status) && isCustomer.value,
)

const canShip = computed(() =>
  ['paid', 'in_progress'].includes(props.order.status) && isSupplier.value,
)

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(num)
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const formatStatus = (status: string) => {
  const label: Record<string, string> = {
    pending: 'Pending',
    awaiting_payment: 'Awaiting Payment',
    paid: 'Paid',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    refunded: 'Refunded',
    shipped: 'Shipped',
  }
  return label[status] ?? status
}

const getStatusBadgeClass = (status: string) => {
  const base = 'px-3 py-1 rounded-full text-xs font-medium'
  const color: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    awaiting_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-sky-100 text-sky-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
    shipped: 'bg-indigo-100 text-indigo-800',
  }
  return `${base} ${color[status] ?? 'bg-gray-100 text-gray-800'}`
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="emit('go-back')"
            class="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Order #{{ order.orderNumber }}
            </h1>
            <p class="text-sm text-gray-500">
              Created on {{ formatDate(order.orderDate) }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <span :class="getStatusBadgeClass(order.status)">
            {{ formatStatus(order.status) }}
          </span>
          <div class="text-sm text-gray-600">
            <span class="font-medium">Total: </span>
            <span class="text-lg font-bold text-gray-900">
              {{ formatCurrency(grandTotal) }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-if="canCancel"
          @click="emit('cancel-order')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Cancel Order
        </button>

        <button
          v-if="canProcessPayment"
          @click="emit('process-payment')"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          Process Payment
        </button>

        <button
          v-if="canShip"
          @click="emit('ship-order')"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          Ship Order
        </button>

        <button
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          Print
        </button>
      </div>
    </div>
  </div>
</template>
