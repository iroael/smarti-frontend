<script setup lang="ts">
import type { Order } from '@/components/orders/data/schema'

import ConfirmDialog from '@/components/orders/components/detail/ConfirmDialog.vue'
import CustomerInfo from '@/components/orders/components/detail/CustomerInfo.vue'
import OrderHeader from '@/components/orders/components/detail/OrderHeader.vue'
import OrderItems from '@/components/orders/components/detail/OrderItems.vue'
import OrderNotes from '@/components/orders/components/detail/OrderNotes.vue'
import OrderTimeline from '@/components/orders/components/detail/OrderTimeline.vue'
import PaymentInfo from '@/components/orders/components/detail/PaymentInfo.vue'
import ShippingFormModal from '@/components/orders/components/detail/ShippingFormModal.vue'
import ShippingTracking from '@/components/orders/components/detail/ShippingTracking.vue'
import SupplierInfo from '@/components/orders/components/detail/SupplierInfo.vue'

import { useToast } from '@/components/ui/toast'
import { useOrderActions } from '@/composables/orders/useOrderAction'
import { useOrderCalculations } from '@/composables/orders/useOrderCalculations'
import { useOrderData } from '@/composables/orders/useOrderData'

import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSalesOrder } from '~/composables/useSalesOrder'

const { toast } = useToast()
const route = useRoute()
const router = useRouter()
const { getSalesOrderById, cancelSalesOrder, prosesPayments } = useSalesOrder()

const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref<Error | null>(null)

const { dummyPayments, orderTimeline } = useOrderData(order)
const { calculateItemTotal, calculateGrandTotal } = useOrderCalculations(order)

// Dialog states
const isCancelDialogOpen = ref(false)
const isPaymentDialogOpen = ref(false)
const shippingModalOpen = ref(false)

const shippingPromise = ref<{
  resolve: (v: any) => void
  reject: () => void
} | null>(null)

// Handlers
const openShippingForm = () => {
  shippingModalOpen.value = true
  return new Promise<{ courierName: string; trackingNumber: string } | null>((resolve) => {
    shippingPromise.value = {
      resolve,
      reject: () => resolve(null),
    }
  })
}

const onShippingSubmit = (payload: { courierName: string; trackingNumber: string }) => {
  shippingModalOpen.value = false
  shippingPromise.value?.resolve(payload)
}

const onShippingCancel = () => {
  shippingModalOpen.value = false
  shippingPromise.value?.resolve(null)
}

// Use action composable
const { goBack, editOrder, processPayment, shipOrder } = useOrderActions(
  router,
  order,
  openShippingForm
)

// Fetch order data
const fetchOrderData = async () => {
  try {
    loading.value = true
    const orderId = route.params.id
    const orderData = await getSalesOrderById(orderId)

    if (orderData) {
      order.value = orderData
    } else {
      throw new Error('Order not found')
    }
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

// Cancel order
const handleCancelOrder = async () => {
  try {
    if (!order.value) return

    const res = await cancelSalesOrder(order.value.id)

    if (res) {
      order.value = res
      toast({
        title: 'Order Cancelled',
        description: `Order #${order.value.orderNumber} has been cancelled.`,
      })
      isCancelDialogOpen.value = false
    } else {
      throw new Error('Failed to cancel order')
    }
  } catch (err) {
    toast({
      title: 'Cancel Failed',
      description: err instanceof Error ? err.message : 'An error occurred',
      variant: 'destructive',
    })
  }
}

// Payment handler
const handleProcessPayment = async () => {
  if (!order.value) return

  try {
    const res = await prosesPayments(order.value.id)
    console.log('Response SnapToken:', res)

    const snapToken = res?.snapToken

    if (!snapToken) {
      toast({
        title: 'Failed to get payment token',
        description: 'Cannot proceed with payment.',
        variant: 'destructive',
      })
      return
    }

    window.snap.pay(snapToken, {
      onSuccess: async () => {
        toast({
          title: 'Payment Successful',
          description: `Order #${order.value?.orderNumber} has been paid.`,
        })
      },
      onPending: () => {
        toast({
          title: 'Payment Pending',
          description: 'Waiting for payment confirmation.',
        })
      },
      onError: () => {
        toast({
          title: 'Payment Failed',
          description: 'Payment process failed.',
          variant: 'destructive',
        })
      },
      onClose: () => {
        toast({
          title: 'Payment Cancelled',
          description: 'You closed the payment popup.',
        })
      },
    })
  } catch (err) {
    console.error(err)
    toast({
      title: 'Payment Error',
      description: 'Failed to process payment.',
      variant: 'destructive',
    })
  }
}


// Lifecycle
onMounted(() => {
  fetchOrderData()
})

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) fetchOrderData()
  }
)

const refreshOrder = async () => {
  await fetchOrderData()
}

const retryFetch = () => {
  error.value = null
  fetchOrderData()
}

definePageMeta({
  title: 'Order Detail',
  description: 'View detailed information about your order',
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-300 rounded p-4">
      <p class="text-red-800">{{ error.message }}</p>
      <button @click="retryFetch" class="mt-2 px-4 py-2 bg-red-600 text-white rounded">
        Retry
      </button>
    </div>

    <div v-else-if="order">
      <OrderHeader
        :order="order"
        :grand-total="calculateGrandTotal()"
        @go-back="goBack"
        @edit-order="editOrder"
        @cancel-order="isCancelDialogOpen = true"
        @process-payment="isPaymentDialogOpen = true"
        @ship-order="shipOrder"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <OrderItems
            :items="order.items"
            :total="order.total"
            :shipping-cost="order.shippingCost"
            :grand-total="calculateGrandTotal()"
            :calculate-item-total="calculateItemTotal"
          />
          <SupplierInfo :supplier="order.supplier" />
          <PaymentInfo :payments="dummyPayments" />
          <ShippingTracking
            v-if="order.shippings && order.shippings.length > 0"
            :shipping="order.shippings[0]"
            @refresh="refreshOrder"
          />
          <OrderNotes v-if="order.notes" :notes="order.notes" />
        </div>
        <div class="space-y-6">
          <CustomerInfo
            :customer="order.customer"
            :delivery-address="order.deliveryAddress"
          />
          <OrderTimeline :timeline="orderTimeline" />
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="isCancelDialogOpen"
      title="Cancel Order"
      description="Are you sure you want to cancel this order?"
      @cancel="isCancelDialogOpen = false"
      @confirm="handleCancelOrder"
      @update:open="isCancelDialogOpen = $event"
    />

    <ConfirmDialog
      :open="isPaymentDialogOpen"
      title="Confirm Payment"
      description="Are you sure you want to process this payment?"
      @cancel="isPaymentDialogOpen = false"
      @confirm="handleProcessPayment"
      @update:open="isPaymentDialogOpen = $event"
    />

    <ShippingFormModal
      :open="shippingModalOpen"
      @submit="onShippingSubmit"
      @cancel="onShippingCancel"
    />
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