

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSalesOrder } from '~/composables/useSalesOrder'
import type { Order } from '@/components/orders/data/schema'

const route = useRoute()
const router = useRouter()
const { getSalesOrderById } = useSalesOrder()

const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref<Error | null>(null)

// Dummy data for payments
const dummyPayments = ref([
  {
    id: 1,
    method: 'Bank Transfer (BCA)',
    amount: '44400.00',
    status: 'completed',
    date: '2025-06-19T10:30:00Z',
    reference: 'TXN20250619001'
  }
])

// Dummy data for shipping
const dummyShipping = ref({
  carrier: 'JNE Express',
  trackingNumber: 'JNE123456789012',
  status: 'in_transit',
  events: [
    {
      description: 'Package picked up',
      location: 'Jakarta Distribution Center',
      date: '2025-06-19T14:00:00Z',
      completed: true
    },
    {
      description: 'In transit to destination',
      location: 'Surabaya Hub',
      date: '2025-06-20T08:00:00Z',
      completed: true
    },
    {
      description: 'Out for delivery',
      location: 'Purwokerto Delivery Station',
      date: '2025-06-20T09:00:00Z',
      completed: false
    },
    {
      description: 'Delivered',
      location: 'Customer Address',
      date: null,
      completed: false
    }
  ]
})

// Order timeline computed property
const orderTimeline = computed(() => {
  if (!order.value) return []
  
  const timeline = [
    {
      title: 'Order Created',
      description: 'Order has been placed',
      date: order.value.orderDate,
      completed: true,
      icon: 'ShoppingCartIcon'
    },
    {
      title: 'Payment Processing',
      description: 'Waiting for payment confirmation',
      date: order.value.status !== 'pending' ? '2025-06-19T10:30:00Z' : null,
      completed: order.value.status !== 'pending',
      icon: 'CreditCardIcon'
    },
    {
      title: 'Order Confirmed',
      description: 'Payment confirmed, preparing for shipment',
      date: order.value.status === 'paid' || order.value.status === 'shipped' || order.value.status === 'delivered' ? '2025-06-19T11:00:00Z' : null,
      completed: order.value.status === 'paid' || order.value.status === 'shipped' || order.value.status === 'delivered',
      icon: 'CheckCircleIcon'
    },
    {
      title: 'Shipped',
      description: 'Order has been shipped',
      date: order.value.status === 'shipped' || order.value.status === 'delivered' ? '2025-06-19T14:00:00Z' : null,
      completed: order.value.status === 'shipped' || order.value.status === 'delivered',
      icon: 'TruckIcon'
    },
    {
      title: 'Delivered',
      description: 'Order has been delivered',
      date: order.value.status === 'delivered' ? '2025-06-20T10:00:00Z' : null,
      completed: order.value.status === 'delivered',
      icon: 'HomeIcon'
    }
  ]
  
  return timeline
})

// Fetch order data
const fetchOrderData = async () => {
  try {
    loading.value = true
    const orderId = parseInt(route.params.id as string)
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

// Action methods
const goBack = () => {
  router.push('/orderss')
}

const editOrder = () => {
  router.push(`/orderss/${order.value?.id}/edit`)
}

const cancelOrder = async () => {
  if (confirm('Are you sure you want to cancel this order?')) {
    // Implement cancel logic
    console.log('Canceling order:', order.value?.id)
  }
}

const processPayment = () => {
  // Implement payment processing logic
  console.log('Processing payment for order:', order.value?.id)
}

const shipOrder = () => {
  // Implement shipping logic
  console.log('Shipping order:', order.value?.id)
}

// Utility functions
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusClass = (status: string) => {
  const classes = {
    completed: 'bg-green-500',
    pending: 'bg-yellow-500',
    failed: 'bg-red-500'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-500'
}

const getPaymentStatusTextClass = (status: string) => {
  const classes = {
    completed: 'text-green-600',
    pending: 'text-yellow-600',
    failed: 'text-red-600'
  }
  return classes[status as keyof typeof classes] || 'text-gray-600'
}

const getShippingStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchOrderData()
})
</script>
<template>
  <div class="w-full flex flex-col items-stretch gap-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
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
    </div>

    <!-- Order Detail -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ order.orderNumber }}</h1>
              <p class="text-sm text-gray-500 mt-1">Order Date: {{ formatDate(order.orderDate) }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ capitalizeFirst(order.status) }}
              </span>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(order.total) }}</p>
                <p class="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button @click="goBack" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Orders
          </button>
          
          <div class="flex space-x-3">
            <button 
              v-if="order.status === 'pending'" 
              @click="cancelOrder"
              class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Cancel Order
            </button>
            
            <button 
              @click="editOrder"
              class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Order
            </button>

            <button 
              v-if="order.status === 'pending'"
              @click="processPayment"
              class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Process Payment
            </button>

            <button 
              v-if="order.status === 'paid'"
              @click="shipOrder"
              class="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              Ship Order
            </button>
          </div>
        </div>
      </div>

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Order Items</h2>
            </div>
            <div class="px-6 py-4">
              <div class="space-y-4">
                <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex-1">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="text-sm font-medium text-gray-900">{{ item.product.name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">{{ item.product.description }}</p>
                        <div class="flex items-center mt-2 space-x-4">
                          <span class="text-xs text-gray-500">SKU: {{ item.product.product_code }}</span>
                          <span class="text-xs text-gray-500">Supplier: {{ item.product.supplier?.name }}</span>
                          <span v-if="item.product.is_bundle" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Bundle
                          </span>
                        </div>
                      </div>
                      <div class="text-right ml-4">
                        <p class="text-sm font-medium text-gray-900">{{ formatCurrency(item.price) }}</p>
                        <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                        <p class="text-sm font-semibold text-gray-900 mt-1">{{ formatCurrency(parseFloat(item.price) * item.quantity) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="text-gray-900">{{ formatCurrency(order.total) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tax (11%)</span>
                    <span class="text-gray-900">{{ formatCurrency(parseFloat(order.total) * 0.11) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Shipping</span>
                    <span class="text-gray-900">{{ formatCurrency(15000) }}</span>
                  </div>
                  <div class="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span class="text-gray-900">Total</span>
                    <span class="text-gray-900">{{ formatCurrency(parseFloat(order.total) * 1.11 + 15000) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Payment Information</h2>
            </div>
            <div class="px-6 py-4">
              <div class="space-y-4">
                <div v-for="payment in dummyPayments" :key="payment.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div :class="getPaymentStatusClass(payment.status)" class="w-3 h-3 rounded-full"></div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ payment.method }}</p>
                      <p class="text-sm text-gray-500">{{ formatDate(payment.date) }}</p>
                      <p class="text-xs text-gray-400">Ref: {{ payment.reference }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount) }}</p>
                    <span :class="getPaymentStatusTextClass(payment.status)" class="text-xs font-medium">
                      {{ capitalizeFirst(payment.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Tracking -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Shipping Tracking</h2>
            </div>
            <div class="px-6 py-4">
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ dummyShipping.carrier }}</p>
                    <p class="text-sm text-gray-500">Tracking: {{ dummyShipping.trackingNumber }}</p>
                  </div>
                  <span :class="getShippingStatusClass(dummyShipping.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                    {{ capitalizeFirst(dummyShipping.status) }}
                  </span>
                </div>
                
                <div class="flow-root">
                  <ul class="-mb-8">
                    <li v-for="(event, eventIdx) in dummyShipping.events" :key="eventIdx">
                      <div class="relative pb-8">
                        <span v-if="eventIdx !== dummyShipping.events.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        <div class="relative flex space-x-3">
                          <div>
                            <span :class="event.completed ? 'bg-green-500' : 'bg-gray-400'" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                              <svg v-if="event.completed" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                              <svg v-else class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                            </span>
                          </div>
                          <div class="min-w-0 flex-1 pt-1.5">
                            <div>
                              <p class="text-sm text-gray-900">{{ event.description }}</p>
                              <p class="text-sm text-gray-500">{{ event.location }}</p>
                            </div>
                            <div class="mt-2 text-sm text-gray-500">
                              {{ formatDateTime(event.date) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Customer Information -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Customer Information</h2>
            </div>
            <div class="px-6 py-4 space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Name</label>
                <p class="text-sm text-gray-900">{{ order.customer.name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Email</label>
                <p class="text-sm text-gray-900">{{ order.customer.email }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Phone</label>
                <p class="text-sm text-gray-900">{{ order.customer.phone }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">NPWP</label>
                <p class="text-sm text-gray-900">{{ order.customer.npwp }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Address</label>
                <p class="text-sm text-gray-900">{{ order.customer.address }}</p>
                <p class="text-sm text-gray-900">{{ order.customer.city }}, {{ order.customer.province }} {{ order.customer.postalcode }}</p>
              </div>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Order Timeline</h2>
            </div>
            <div class="px-6 py-4">
              <div class="flow-root">
                <ul class="-mb-8">
                  <li v-for="(event, eventIdx) in orderTimeline" :key="eventIdx">
                    <div class="relative pb-8">
                      <span v-if="eventIdx !== orderTimeline.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span :class="event.completed ? 'bg-blue-500' : 'bg-gray-400'" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                            <component :is="event.icon" class="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                            <p class="text-sm text-gray-500">{{ event.description }}</p>
                          </div>
                          <div class="mt-2 text-sm text-gray-500">
                            {{ event.date ? formatDateTime(event.date) : 'Pending' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>