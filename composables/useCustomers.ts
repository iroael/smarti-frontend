import { ref } from 'vue'
import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'

const customers = ref([])
const loading = ref(false)

export function useCustomers() {
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

  const fetchCustomers = async () => {
    loading.value = true
    try {
      const { data } = await useFetch(`${config.public.apiBase}/customers`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      customers.value = data.value?.data ?? []
    }
    catch (error) {
      console.error('[useCustomers] Failed to fetch customers:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  const getCustomer = async (id: number) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      
      if (error.value) {
        console.error('[useCustomers] Failed to get customer:', error.value)
        throw error.value
      }
      // console.log('getCustomer', data.value)
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in getCustomer:', error)
      throw error
    }
  }

  const createCustomer = async (payload: any) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: payload,
      })
      if (error.value) {
        console.error('[useCustomers] Failed to create customer:', error.value)
        throw error.value
      }
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in createCustomer:', error)
      throw error
    }
  }

  const updateCustomer = async (id: number, payload: any) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: payload,
      })
      if (error.value) {
        console.error('[useCustomers] Failed to update customer:', error.value)
        throw error.value
      }
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in updateCustomer:', error)
      throw error
    }
  }

  const deleteCustomer = async (id: number) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (error.value) {
        console.error('[useCustomers] Failed to delete customer:', error.value)
        throw error.value
      }
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in deleteCustomer:', error)
      throw error
    }
  }

  const addCustomerAddress = async (customerId: number, payload: any) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: payload,
      })
      if (error.value) {
        console.error('[useCustomers] Failed to add customer address:', error.value)
        throw error.value
      }
      
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in addCustomerAddress:', error)
      throw error
    }
  }

  const setDefaultCustomerAddress = async (customerId: number, addressId: number) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers/${customerId}/addresses/${addressId}/default`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
      if (error.value) {
        console.error('[useCustomers] Failed to set default address:', error.value)
        throw error.value
      }
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in setDefaultCustomerAddress:', error)
      throw error
    }
  }

  const getCurrentCustomer = async () => {
    try {
      // Check if user is authenticated
      if (!authStore.token) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await useFetch(`${config.public.apiBase}/customers/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      if (error.value) {
        console.error('[useCustomers] Failed to get current customer:', error.value)
        throw error.value
      }
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in getCurrentCustomer:', error)
      throw error
    }
  }

  const deleteAddressCustomer = async (id: number) => {
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/customers/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (error.value) {
        console.error('[useCustomers] Failed to delete customer:', error.value)
        throw error.value
      }
      return data.value
    }
    catch (error) {
      console.error('[useCustomers] Error in deleteCustomer:', error)
      throw error
    }
  }

  // Additional helper to check authentication status
  const isAuthenticated = computed(() => !!authStore.token)

  return {
    customers,
    loading,
    isAuthenticated,
    fetchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addCustomerAddress,
    setDefaultCustomerAddress,
    getCurrentCustomer,
    deleteAddressCustomer,
  }
}
