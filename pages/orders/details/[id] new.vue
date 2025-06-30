<!-- pages/orders/[id].vue - Order Detail Page -->

<script setup lang="ts">
import type { Order } from '@/components/orders/data/schema'

// Import child components
import CustomerInfo from '@/components/orders/components/detail/CustomerInfo.vue'
import OrderHeader from '@/components/orders/components/detail/OrderHeader.vue'
import OrderItems from '@/components/orders/components/detail/OrderItems.vue'
import OrderNotes from '@/components/orders/components/detail/OrderNotes.vue'
import OrderTimeline from '@/components/orders/components/detail/OrderTimeline.vue'
import PaymentInfo from '@/components/orders/components/detail/PaymentInfo.vue'
import ShippingTracking from '@/components/orders/components/detail/ShippingTracking.vue'
import SupplierInfo from '@/components/orders/components/detail/SupplierInfo.vue'

// Import composables for business logic
import { useOrderActions } from '@/composables/orders/useOrderAction'
import { useOrderCalculations } from '@/composables/orders/useOrderCalculations'
import { useOrderData } from '@/composables/orders/useOrderData'
import { useOrderFormatters } from '@/composables/orders/useOrderFormatters'

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSalesOrder } from '~/composables/useSalesOrder'

// ANALISIS STRUKTUR:

// 1. ROUTING & NAVIGATION
const route = useRoute()  // Akses parameter [id] dari URL
const router = useRouter() // Untuk navigasi programmatic
const { getSalesOrderById } = useSalesOrder() // Composable untuk fetch data

// 2. REACTIVE STATE MANAGEMENT
const order = ref<Order | null>(null) // Main data order
const loading = ref(true)             // Loading state
const error = ref<Error | null>(null) // Error handling

// 3. COMPOSABLES PATTERN
// Memisahkan logic ke composables untuk reusability
const { dummyPayments, dummyShipping, orderTimeline } = useOrderData(order)
const { calculateItemTotal, calculateTotalTax, calculateGrandTotal } = useOrderCalculations(order)
const { formatCurrency, formatDate, formatDateTime, capitalizeFirst, getStatusClass } = useOrderFormatters()
const { goBack, editOrder, cancelOrder, processPayment, shipOrder } = useOrderActions(router, order)

// 4. DATA FETCHING
const fetchOrderData = async () => {
  try {
    loading.value = true
    const orderId = route.params.id // Ambil ID dari URL parameter
    const orderData = await getSalesOrderById(orderId)
    
    if (orderData) {
      order.value = orderData
    } else {
      throw new Error('Sales order not found')
    }
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

// 5. LIFECYCLE
onMounted(() => {
  console.log('Order Shippings:', order)

  fetchOrderData() // Fetch data saat component mounted
})

// REKOMENDASI IMPROVEMENTS:

// 1. Tambahkan SEO meta
definePageMeta({
  title: 'Order Detail',
  description: 'View detailed information about your order'
})

// 3. Add refresh functionality
const refreshOrder = async () => {
  await fetchOrderData()
}

// 4. Add error retry
const retryFetch = () => {
  error.value = null
  fetchOrderData()
}

// 5. Watch for route changes (jika user navigate ke order lain)
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchOrderData()
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-6">
    <!-- LOADING STATE -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading order details...</p>
      </div>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading sales order</h3>
            <div class="mt-2 text-sm text-red-700">{{ error.message }}</div>
          </div>
        </div>
        <button 
          @click="retryFetch"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- ORDER DETAIL CONTENT -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header Section -->
      <OrderHeader 
        :order="order"
        :grand-total="calculateGrandTotal()"
        @go-back="goBack"
        @edit-order="editOrder"
        @cancel-order="cancelOrder"
        @process-payment="processPayment"
        @ship-order="shipOrder"
        @refresh="refreshOrder"
      />

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <OrderItems
            :items="order.items"
            :total="order.total"
            :shipping-cost="order.shippingCost"
            :grand-total="calculateGrandTotal()"
            :calculate-item-total="calculateItemTotal"
          />

          <!-- Supplier Information -->
          <SupplierInfo :supplier="order.supplier" />

          <!-- Payment Information -->
          <PaymentInfo :payments="dummyPayments" />

          <!-- Shipping Tracking -->
          <ShippingTracking
            v-if="order.shippings && order.shippings.length > 0"
            :shipping="order.shippings[0]"
            @refresh="refreshOrder"
          />
          <!-- Order Notes (conditional) -->
          <OrderNotes v-if="order.notes" :notes="order.notes" />
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Customer Information -->
          <CustomerInfo
            :customer="order.customer"
            :delivery-address="order.deliveryAddress"
          />

          <!-- Order Timeline -->
          <OrderTimeline :timeline="orderTimeline" />
        </div>
      </div>
    </div>

    <!-- Empty State (if no order found) -->
    <div v-else class="flex flex-col items-center justify-center h-64 text-center">
      <svg class="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
      <p class="text-gray-600 mb-4">The order you're looking for doesn't exist or has been removed.</p>
      <NuxtLink to="/orders" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Back to Orders
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>