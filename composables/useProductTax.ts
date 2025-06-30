// composables/useProductTax.ts

import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const taxes = ref<any[]>([])
const loading = ref(false)

export function useProductTax() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }
    return headers
  }

  const fetchTaxes = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/taxes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value

      taxes.value = Array.isArray(data.value) ? data.value : data.value?.data ?? []

      if (taxes.value.length === 0) {
        console.warn('Tidak ada data pajak ditemukan.')
      }
    } catch (err) {
      console.error('Gagal mengambil data pajak:', err)
      throw err
    } finally {
      loading.value = false
    }
  }


  const getTaxById = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/taxes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (error.value) throw error.value
    return data.value
  }

  const createTax = async (payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/taxes`, {
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

  const updateTax = async (id: number, payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/taxes/${id}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    if (error.value) throw error.value
    return data.value
  }

  const deleteTax = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/taxes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (error.value) throw error.value
    return data.value
  }

  return {
    taxes,
    loading,
    fetchTaxes,
    getTaxById,
    createTax,
    updateTax,
    deleteTax,
  }
}
