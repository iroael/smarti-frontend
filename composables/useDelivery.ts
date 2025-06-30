import type { UseFetchOptions } from '#app'
import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { Shipping, ShippingResponse } from '~/types/schema' // Sesuaikan path

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)
const delivery = ref<Shipping[]>([])

export function useDelivery() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }
    return headers
  }

  const fetchDelivery = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useFetch<ShippingResponse>(`${config.public.apiBase}/shippings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to fetch delivery data')
      }

      if (data.value) {
        // Pastikan data sesuai dengan struktur response
        delivery.value = Array.isArray(data.value) ? data.value : data.value?.data ?? []
        
        if (delivery.value.length === 0) {
          console.warn('Tidak ada data delivery ditemukan.')
        }
      } else {
        delivery.value = []
      }
    } catch (err: any) {
      console.error('Gagal mengambil data delivery:', err)
      error.value = err.message || 'Terjadi kesalahan saat mengambil data delivery'
      delivery.value = []
    } finally {
      loading.value = false
    }
  }

  const getDeliveryOrderById = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useFetch<Shipping>(`${config.public.apiBase}/shippings/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to fetch delivery order')
      }

      return data.value
    } catch (err: any) {
      error.value = err.message || 'Terjadi kesalahan saat mengambil data delivery order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDeliveryOrderByOrderId = async (orderId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useFetch<Shipping>(`${config.public.apiBase}/shippings/by-order/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to fetch delivery order by order ID')
      }

      return data.value
    } catch (err: any) {
      error.value = err.message || 'Terjadi kesalahan saat mengambil data delivery order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDeliveryOrder = async (payload: Partial<Shipping>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch<Shipping>(`${config.public.apiBase}/shippings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: payload,
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to create delivery order')
      }

      // Refresh data setelah create
      await fetchDelivery()

      return data.value
    }
    catch (err: any) {
      error.value = err.message || 'Terjadi kesalahan saat membuat delivery order'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateDeliveryOrder = async (id: number, payload: Partial<Shipping>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch<Shipping>(`${config.public.apiBase}/shippings/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: payload,
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to update delivery order')
      }

      // Refresh data setelah update
      await fetchDelivery()

      return data.value
    }
    catch (err: any) {
      error.value = err.message || 'Terjadi kesalahan saat mengupdate delivery order'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteDeliveryOrder = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useFetch(`${config.public.apiBase}/shippings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to delete delivery order')
      }

      // Refresh data setelah delete
      await fetchDelivery()
      
      return data.value
    } catch (err: any) {
      error.value = err.message || 'Terjadi kesalahan saat menghapus delivery order'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset error function
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    delivery,
    loading,
    error,
    
    // Methods
    fetchDelivery,
    getDeliveryOrderById,
    getDeliveryOrderByOrderId,
    createDeliveryOrder,
    updateDeliveryOrder,
    deleteDeliveryOrder,
    clearError,
  }
}