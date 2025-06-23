import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'

const addresses = ref([])
const loading = ref(false)

export function useAddress() {
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

  // Get ownerId and ownerType from auth store
  const getOwnerInfo = () => {
    const ownerId = authStore.user?.profile.id
    const ownerType = authStore.user?.role // You can make this dynamic if needed
    return { ownerId, ownerType }
  }

  const fetchAddresses = async (customOwnerId?: number, customOwnerType?: string) => {
    loading.value = true
    try {
      const { ownerId, ownerType } = getOwnerInfo()
      // Use custom values if provided, otherwise use from auth
      const finalOwnerId = customOwnerId || ownerId
      const finalOwnerType = customOwnerType || ownerType

      if (!finalOwnerId) {
        throw new Error('Owner ID not found')
      }

      const data = await $fetch(`/address`, {
        method: 'GET',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
        query: {
          ownerId: finalOwnerId,
          ownerType: finalOwnerType,
        },
      })
      addresses.value = data
    }
    catch (error) {
      console.error('[useAddress] Failed to fetch addresses:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  // Convenience method to fetch current user's addresses
  const fetchUserAddresses = async () => {
    return fetchAddresses()
  }

  const createAddress = async (payload: any) => {
    try {
      const { ownerId, ownerType } = getOwnerInfo()

      // Add owner info to payload if not already present
      const finalPayload = {
        ...payload,
        ownerId: payload.ownerId || ownerId,
        ownerType: payload.ownerType || ownerType,
      }

      const data = await $fetch(`/address`, {
        method: 'POST',
        baseURL: config.public.apiBase,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: finalPayload,
      })
      return data
    }
    catch (error) {
      console.error('[useAddress] Failed to create address:', error)
      throw error
    }
  }

  const updateAddress = async (addressId: number, payload: any) => {
    try {
      const data = await $fetch(`/address/${addressId}`, {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: payload,
      })
      return data
    }
    catch (error) {
      console.error('[useAddress] Failed to update address:', error)
      throw error
    }
  }

  const deleteAddress = async (addressId: number) => {
    try {
      const data = await $fetch(`/address/${addressId}`, {
        method: 'DELETE',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
      })
      return data
    } catch (error) {
      console.error('[useAddress] Failed to delete address:', error)
      throw error
    }
  }

  const setDefaultAddress = async (addressId: number) => {
    try {
      const data = await $fetch(`/address/${addressId}/set-default`, {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
      })
      return data
    } catch (error) {
      console.error('[useAddress] Failed to set default address:', error)
      throw error
    }
  }

  const isAuthenticated = computed(() => !!authStore.token)

  // Computed properties for easier access
  const defaultAddress = computed(() => addresses.value.find((addr: any) => addr.is_default))
  const otherAddresses = computed(() => addresses.value.filter((addr: any) => !addr.is_default))

  return {
    addresses,
    loading,
    isAuthenticated,
    defaultAddress,
    otherAddresses,
    fetchAddresses,
    fetchUserAddresses, // Convenience method
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getOwnerInfo, // Export in case needed elsewhere
  }
}
