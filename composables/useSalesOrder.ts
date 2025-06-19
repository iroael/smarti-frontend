import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { orderSchema, ordersResponseSchema, type Order } from '@/components/sales-order/data/schema'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

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
      }
    })

    if (fetchError.value) {
      console.error(`Error fetching order ${id}`, fetchError.value)
      return null
    }

    return data.value ?? null
  }

  const createSalesOrder = async (payload: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>): Promise<Order | null> => {
    const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: payload,
      transform: (rawData) => {
        const parsed = orderSchema.safeParse(rawData.order)
        if (!parsed.success) {
          console.error('Failed to parse created order:', parsed.error)
          return null
        }

        return {
          ...parsed.data,
          snapToken: rawData.snapToken // ambil snapToken kalau ada
        }
      },
    })

    if (fetchError.value) {
      console.error('Create order error:', fetchError.value)
      return null
    }

    return data.value ?? null
  }

  const updateSalesOrder = async (id: number, payload: Partial<Order>): Promise<Order | null> => {
    const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/orders/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: payload,
      transform: (rawData) => {
        const parsed = orderSchema.safeParse(rawData)
        if (!parsed.success) {
          console.error('Failed to parse updated order:', parsed.error)
          return null
        }
        return parsed.data
      }
    })

    if (fetchError.value) {
      console.error('Update order error:', fetchError.value)
      return null
    }

    return data.value ?? null
  }

  const deleteSalesOrder = async (id: number): Promise<boolean> => {
    const { error: fetchError } = await useFetch(`${config.public.apiBase}/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (fetchError.value) {
      console.error('Delete order error:', fetchError.value)
      return false
    }

    return true
  }

  return {
    salesOrders,
    loading,
    error,
    fetchSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
  }
}
