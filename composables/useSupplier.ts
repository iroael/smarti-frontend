import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import {
  supplierSchema,
  suppliersResponseSchema,
  type Supplier,
} from '@/components/supplier/data/schema'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const suppliers = ref<Supplier[]>([])
const loading = ref(false)

export function useSuppliers() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return headers
  }

  const fetchSuppliers = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/suppliers`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      console.log('Response data:', data.value)
      if (error.value) throw error.value

      const parsed = suppliersResponseSchema.safeParse(data.value)
      if (!parsed.success) {
        console.error(parsed.error.format())
        throw new Error('Format respons supplier tidak valid')
      }

      suppliers.value = parsed.data.data
    } catch (err) {
      console.error('Gagal mengambil data supplier:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSupplierById = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/suppliers/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    if (error.value) throw error.value

    const parsed = supplierSchema.safeParse(data.value)
    if (!parsed.success) {
      console.error(parsed.error.format())
      throw new Error('Format supplier tidak valid')
    }

    return parsed.data
  }

  const createSupplier = async (payload: Omit<Supplier, 'id' | 'created_at'>) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/suppliers`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    if (error.value) throw error.value
    return data.value
  }

  const updateSupplier = async (id: number, payload: Partial<Supplier>) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    if (error.value) throw error.value
    return data.value
  }

  const deleteSupplier = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (error.value) throw error.value
    return data.value
  }

  return {
    suppliers,
    loading,
    fetchSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}
