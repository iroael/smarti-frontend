// composables/useOrderData.ts
import { computed, ref, type Ref } from 'vue'
import type { Order } from '@/components/orders/data/schema'

export const useOrderData = (order: Ref<Order | null>) => {
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

  return {
    dummyPayments,
    dummyShipping,
    orderTimeline
  }
}