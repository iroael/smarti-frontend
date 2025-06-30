// composables/useOrderActions.ts
import type { Order } from '@/components/orders/data/schema'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import { useToast } from '@/components/ui/toast'
import { useDelivery } from '../useDelivery'
import { useSalesOrder } from '../useSalesOrder'

export const useOrderActions = (
  router: Router,
  order: Ref<Order | null>,
  openShippingForm: () => Promise<{ courierName: string; trackingNumber: string } | null>,
) => {
  const { updateSalesOrder, prosesPayments } = useSalesOrder()
  const { createDeliveryOrder, completeDeliveryOrder } = useDelivery()
  const { toast } = useToast()

  const goBack = () => router.push('/orders')

  const editOrder = () => {
    if (order.value) router.push(`/orders/${order.value.id}/edit`)
  }

  const cancelOrder = async () => {
    if (!order.value) return

    try {
      const updated = await updateSalesOrder(order.value.id, {
        status: 'cancelled',
      })

      if (updated) {
        toast({
          title: 'Order Cancelled',
          description: `Order #${order.value.orderNumber} has been cancelled.`,
        })
        order.value = updated
      }
    } catch {
      toast({
        title: 'Failed to Cancel',
        description: 'There was an error cancelling this order.',
        variant: 'destructive',
      })
    }
  }

  const processPayment = async () => {
    if (!order.value) return

    try {
      const updated = await prosesPayments(order.value.id, {
        status: 'paid',
      })

      if (updated) {
        toast({
          title: 'Payment Processed',
          description: `Payment for order #${order.value.orderNumber} has been processed.`,
        })
        order.value = updated
      }
    } catch {
      toast({
        title: 'Failed to Process Payment',
        description: 'An error occurred while processing payment.',
        variant: 'destructive',
      })
    }
  }

  const shipOrder = async () => {
    if (!order.value) return

    const shippingInfo = await openShippingForm()

    if (!shippingInfo) {
      toast({
        title: 'Shipping Cancelled',
        description: 'You cancelled the shipping process.',
      })
      return
    }

    try {
      await createDeliveryOrder({
        orderId: order.value.id,
        courierName: shippingInfo.courierName,
        trackingNumber: shippingInfo.trackingNumber,
        shippingStatus: 'pending',
        shippedAt: new Date().toISOString(),
      })

      const updated = await updateSalesOrder(order.value.id, {
        status: 'shipped',
      })

      if (updated) {
        toast({
          title: 'Order Shipped',
          description: `Order #${order.value.orderNumber} is now marked as shipped.`,
        })
        order.value = updated

        router.push('/delivery')
      }
    } catch {
      toast({
        title: 'Failed to Ship',
        description: 'An error occurred while processing shipment.',
        variant: 'destructive',
      })
    }
  }

  const deliveryAt = async () => {
    if (!order.value) return

    try {
      await completeDeliveryOrder({
        orderId: order.value.id,
        deliveredAt: new Date().toISOString(),
      })

      const updated = await updateSalesOrder(order.value.id, {
        status: 'completed',
      })

      if (updated) {
        toast({
          title: 'Order Completed',
          description: `Order #${order.value.orderNumber} has been marked as completed.`,
        })
        order.value = updated
      }
    } catch {
      toast({
        title: 'Failed to Complete',
        description: 'An error occurred while completing the delivery.',
        variant: 'destructive',
      })
    }
  }

  return {
    goBack,
    editOrder,
    cancelOrder,
    processPayment,
    shipOrder,
    deliveryAt,
  }
}
