import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'

const taxIdentifications = ref([])
const loading = ref(false)

export function useTaxIdentifications() {
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

  const getOwnerInfo = () => {
    const ownerId = authStore.user?.profile?.id
    const ownerType = authStore.user?.role
    return { ownerId, ownerType }
  }

  const fetchTaxIdentifications = async () => {
    loading.value = true
    try {
      const { ownerId, ownerType } = getOwnerInfo()

      if (!ownerId || !ownerType) {
        throw new Error('Owner ID atau Owner Type tidak ditemukan')
      }

      const data = await $fetch('/tax-identifications', {
        method: 'GET',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
        query: {
          ownerId,
          ownerType,
        },
      })
      taxIdentifications.value = data
    }
    catch (error) {
      console.error('[useTaxIdentifications] Failed to fetch tax identifications:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  const createTaxIdentification = async (payload: any) => {
    try {
      const { ownerId, ownerType } = getOwnerInfo()

      const finalPayload = {
        ...payload,
        ownerId,
        ownerType,
      }

      const data = await $fetch('/tax-identifications', {
        method: 'POST',
        baseURL: config.public.apiBase,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: finalPayload,
      })

      await fetchTaxIdentifications()
      return data
    }
    catch (error) {
      console.error('[useTaxIdentifications] Failed to create:', error)
      throw error
    }
  }

  const updateTaxIdentification = async (id: number, payload: any) => {
    try {
      const data = await $fetch(`/tax-identifications/${id}`, {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: payload,
      })

      await fetchTaxIdentifications()
      return data
    }    catch (error) {
      console.error('[useTaxIdentifications] Failed to update:', error)
      throw error
    }
  }

  const deleteTaxIdentification = async (id: number) => {
    try {
      const data = await $fetch(`/tax-identifications/${id}`, {
        method: 'DELETE',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
      })

      await fetchTaxIdentifications()
      return data
    }
    catch (error) {
      console.error('[useTaxIdentifications] Failed to delete:', error)
      throw error
    }
  }

  const setPrimary = async (id: number) => {
    try {
      const data = await $fetch(`/tax-identifications/${id}/set-primary`, {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
      })
      await fetchTaxIdentifications()
      return data
    }
    catch (error) {
      console.error('[useTaxIdentifications] Failed to set primary:', error)
      throw error
    }
  }

  const toggleActive = async (id: number) => {
    try {
      const data = await $fetch(`/tax-identifications/${id}/toggle-active`, {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
      })
      await fetchTaxIdentifications()
      return data
    }
    catch (error) {
      console.error('[useTaxIdentifications] Failed to toggle active:', error)
      throw error
    }
  }

  const isAuthenticated = computed(() => !!authStore.token)

  const primaryTax = computed(() => taxIdentifications.value.find((t: any) => t.isPrimary))
  const otherTaxes = computed(() => taxIdentifications.value.filter((t: any) => !t.isPrimary))

  return {
    taxIdentifications,
    loading,
    isAuthenticated,
    primaryTax,
    otherTaxes,
    fetchTaxIdentifications,
    createTaxIdentification,
    updateTaxIdentification,
    deleteTaxIdentification,
    setPrimary,
    toggleActive,
    getOwnerInfo,
  }
}
