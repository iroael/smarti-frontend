import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { orderSchema, ordersResponseSchema, type Order } from '@/components/orders/data/schema'
import { useToast } from '@/components/ui/toast'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { toast } = useToast()

const salesOrders = ref<Order[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

export function useSalesOrder() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    // Get token from auth store
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return headers
  }

  const fetchSalesOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders`, {
        method: 'GET',
        headers: getAuthHeaders(),
        transform: (rawData) => {
          const parsed = ordersResponseSchema.safeParse(rawData)
          if (!parsed.success) {
            console.error('Invalid orders response:', parsed.error)
            return []
          }
          return parsed.data.data
        }
      })

      if (fetchError.value) throw fetchError.value
      salesOrders.value = data.value ?? []
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  // ✅ Fetch orders created by the current user (customer or supplier)
  const fetchMyOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        transform: (rawData) => {
          const parsed = ordersResponseSchema.safeParse(rawData)
          if (!parsed.success) {
            console.error('Invalid my orders response:', parsed.error)
            return []
          }
          return parsed.data.data
        }
      })

      if (fetchError.value) throw fetchError.value
      salesOrders.value = data.value ?? []
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  // ✅ Fetch incoming orders for current supplier
  const fetchIncomingOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders/incoming`, {
        method: 'GET',
        headers: getAuthHeaders(),
        transform: (rawData) => {
          const parsed = ordersResponseSchema.safeParse(rawData)
          if (!parsed.success) {
            console.error('Invalid incoming orders response:', parsed.error)
            return []
          }
          return parsed.data.data
        }
      })

      if (fetchError.value) throw fetchError.value
      salesOrders.value = data.value ?? []
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  const getSalesOrderById = async (id: number): Promise<Order | null> => {
    const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      transform: (rawData) => {
        const parsed = orderSchema.safeParse(rawData)
        if (!parsed.success) {
          console.error(`Invalid order ${id}:`, parsed.error)
          return null
        }
        return parsed.data
      },
    })

    if (fetchError.value) {
      console.error(`Error fetching order ${id}`, fetchError.value)
      return null
    }

    return data.value ?? null
  }

  const createSalesOrder = async (
    payload: {
      customerId: number
      notes?: string
      deliveryAddress?: string | number
      shippingCost?: string | number
      items: {
        productId: number
        quantity: number
      }[]
    },
  ): Promise<(Order & { snapToken?: string }) | null> => {
    const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: {
        ...payload,
        deliveryAddress: payload.deliveryAddress,
        shippingCost: payload.shippingCost,
      },
      transform: (rawData) => {
        if (!rawData || !rawData.order) {
          console.error('Invalid response from server. No order object returned.')
          return null
        }
        const parsed = orderSchema.safeParse(rawData.order)
        if (!parsed.success) {
          console.error('Failed to parse created order:', parsed.error)
          return null
        }
        return {
          ...parsed.data,
          snapToken: rawData.snapToken ?? null,
        }
      },
    })

    if (fetchError.value) {
      console.error('Create order error:', fetchError.value)
      return null
    }

    return data.value ?? null
  }

  const updateSalesOrder = async (id: string | number, payload: Partial<Order>): Promise<Order | null> => {
    const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
      transform: (rawData) => {
        const parsed = orderSchema.safeParse(rawData)
        if (!parsed.success) {
          console.error('Failed to parse updated order:', parsed.error)
          return null
        }
        return parsed.data
      },
    })

    if (fetchError.value) {
      console.error('Update order error:', fetchError.value)
      return null
    }

    return data.value ?? null
  }
  const deleteSalesOrder = async (id: string): Promise<boolean> => {
    const { error: fetchError } = await useFetch(`${config.public.apiBase}/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (fetchError.value) {
      console.error('Delete order error:', fetchError.value)
      return false
    }

    return true
  }

  // proses payments
  const prosesPayments = async (orderId: string) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/orders/${orderId}/snap-token`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })

      if (error.value) {
        throw error.value
      }

      return data.value
    } catch (err: any) {
      toast({
        title: 'Failed to Get SnapToken',
        description: err?.message || 'An error occurred',
        variant: 'destructive',
      })
      throw err
    }
  }


  // Cancel order
  const cancelSalesOrder = async (id: string): Promise<Order | null> => {
    const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      transform: (rawData) => {
        const parsed = orderSchema.safeParse(rawData)
        if (!parsed.success) {
          console.error('Failed to parse cancelled order:', parsed.error)
          return null
        }
        return parsed.data
      },
    })

    if (fetchError.value) {
      console.error('Cancel order error:', fetchError.value)
      return null
    }

    return data.value ?? null
  }

  // Update order status
  const updateSalesOrderStatus = async (
    id: string,
    status: string,
  ): Promise<Order | null> => {
    const { data, error: fetchError } = await useFetch(
      `${config.public.apiBase}/orders/${id}/status/${status}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        transform: (rawData) => {
          const parsed = orderSchema.safeParse(rawData)
          if (!parsed.success) {
            console.error('Failed to parse updated status:', parsed.error)
            return null
          }
          return parsed.data
        },
      },
    )

    if (fetchError.value) {
      console.error('Update order status error:', fetchError.value)
      return null
    }

    return data.value ?? null
  }

  return {
    salesOrders,
    loading,
    error,
    fetchSalesOrders,
    fetchMyOrders,
    fetchIncomingOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    prosesPayments,
    cancelSalesOrder,
    updateSalesOrderStatus,
  }
}
