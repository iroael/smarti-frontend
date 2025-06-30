import type { UseFetchOptions } from '#app'
import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

export interface ShippingDestination {
  id: number
  label: string
  province_name: string
  city_name: string
  district_name: string
  subdistrict_name: string
  zip_code: string
}

export interface ShippingCostPayload {
  origin: number | string
  destination: number | string
  weight: number
  courier: string // e.g. 'jne:sicepat:jnt:pos'
  price?: 'lowest' | 'highest' | 'all'
}

export interface ShippingCostResult {
  name: string
  code: string
  service: string
  description: string
  cost: number
  etd: string
}

export interface ShippingCostResponse {
  meta: {
    message: string
    code: number
    status: string
  }
  data: ShippingCostResult[]
}

export interface DestinationResponse {
  meta: {
    message: string
    code: number
    status: string
  }
  data: ShippingDestination[]
}

// Tracking interfaces
export interface TrackingManifest {
  manifest_code: string
  manifest_description: string
  manifest_date: string
  manifest_time: string
  city_name: string
}

export interface TrackingDetails {
  waybill_number: string
  waybill_date: string
  waybill_time: string
  weight: string
  origin: string
  destination: string
  shipper_name: string
  shipper_address1: string
  shipper_address2: string
  shipper_address3: string
  shipper_city: string
  receiver_name: string
  receiver_address1: string
  receiver_address2: string
  receiver_address3: string
  receiver_city: string
}

export interface TrackingDeliveryStatus {
  status: string
  pod_receiver: string
  pod_date: string
  pod_time: string
}

export interface TrackingSummary {
  courier_code: string
  courier_name: string
  waybill_number: string
  service_code: string
  waybill_date: string
  shipper_name: string
  receiver_name: string
  origin: string
  destination: string
  status: string
}

export interface TrackingData {
  delivered: boolean
  summary: TrackingSummary
  details: TrackingDetails
  delivery_status: TrackingDeliveryStatus
  manifest: TrackingManifest[]
}

export interface TrackingResponse {
  meta: {
    message: string
    code: number
    status: string
  }
  data: TrackingData
}

// Reactive state
const destinations = ref<ShippingDestination[]>([])
const costs = ref<ShippingCostResult[]>([])
const trackingData = ref<TrackingData | null>(null)
const loading = ref(false)
const searchLoading = ref(false)
const trackingLoading = ref(false)
const error = ref<string | null>(null)

export function useShipping() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }
    return headers
  }

  const fetchDestinations = async (search: string = '', offset: number = 0, limit: number = 50) => {
    searchLoading.value = true
    error.value = null
    
    try {
      const fetchOptions: UseFetchOptions<DestinationResponse> = {
        method: 'GET',
        headers: getAuthHeaders(),
        query: {
          search,
          offset,
          limit,
        },
        server: false, // Force client-side execution
        onResponseError({ response }) {
          console.error('API Error:', response.status, response.statusText, response._data)
          throw new Error(`Gagal mengambil data tujuan: ${response.statusText}`)
        }
      }

      const { data, error: fetchError } = await useFetch<DestinationResponse>(
        `${config.public.apiBase}/shipping/destination`,
        fetchOptions
      )

      if (fetchError.value) {
        throw fetchError.value
      }

      const responseData = data.value
      if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('Format respons destination tidak valid')
      }

      destinations.value = responseData.data
      return responseData.data
    }
    catch (err: any) {
      console.error('Gagal mengambil data tujuan pengiriman:', err)
      const errorMessage = err.message || err.data?.message || err.response?._data?.message || 'Terjadi kesalahan'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
    finally {
      searchLoading.value = false
    }
  }

  const searchDestinationByAddress = async (address: any): Promise<ShippingDestination | null> => {
    try {
      // Extract search terms from address
      const searchTerms = [
        address.subdistrict_name || address.subdistrict,
        address.district_name || address.district,
        address.city_name || address.city,
        address.province_name || address.province
      ].filter(Boolean).join(' ')

      const results = await fetchDestinations(searchTerms, 0, 10)

      if (results.length === 0) {
        return null
      }

      // Try to find exact match first
      let exactMatch = results.find(dest => {
        const addressMatch = (
          dest.city_name === (address.city_name || address.city) &&
          dest.province_name === (address.province_name || address.province)
        )
        
        if (address.zip_code || address.postal_code) {
          return addressMatch && dest.zip_code === (address.zip_code || address.postal_code)
        }
        
        return addressMatch
      })

      // If no exact match, try partial match
      if (!exactMatch) {
        exactMatch = results.find(dest => 
          dest.city_name.toLowerCase().includes((address.city || '').toLowerCase()) &&
          dest.province_name.toLowerCase().includes((address.province || '').toLowerCase())
        )
      }

      return exactMatch || results[0] // Return first result as fallback
    }
    catch (error) {
      console.error('Error searching destination:', error)
      return null
    }
  }

  const checkShippingCost = async (payload: ShippingCostPayload): Promise<ShippingCostResult[]> => {
    loading.value = true
    error.value = null

    try {
      // Enhanced payload validation
      if (!payload.origin || !payload.destination || !payload.weight || !payload.courier) {
        throw new Error('Origin, destination, weight, dan courier harus diisi')
      }

      if (payload.weight <= 0) {
        throw new Error('Berat harus lebih dari 0')
      }

      // Convert origin and destination to string if they're numbers
      const processedPayload = {
        ...payload,
        origin: String(payload.origin),
        destination: String(payload.destination),
        weight: Number(payload.weight),
      }

      console.log('Sending shipping cost payload:', processedPayload)

      const fetchOptions: UseFetchOptions<ShippingCostResponse> = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: processedPayload,
        server: false, // Force client-side execution
        timeout: 30000, // 30 seconds timeout
        onRequest({ request, options }) {
          console.log('Making request to:', request)
          console.log('Request options:', options)
        },
        onResponse({ response }) {
          console.log('Response status:', response.status)
          console.log('Response data:', response._data)
        },
        onResponseError({ response }) {
          console.error('API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            data: response._data,
            headers: response.headers
          })
          
          let errorMessage = 'Gagal menghitung ongkir'
          
          if (response.status === 400) {
            errorMessage = response._data?.message || 'Data yang dikirim tidak valid'
          } else if (response.status === 401) {
            errorMessage = 'Sesi telah berakhir, silakan login kembali'
          } else if (response.status === 422) {
            errorMessage = response._data?.message || 'Data validasi gagal'
          } else if (response.status === 500) {
            errorMessage = 'Terjadi kesalahan server'
          } else if (response.status === 0 || !response.status) {
            errorMessage = 'Tidak dapat terhubung ke server'
          }
          
          throw new Error(errorMessage)
        }
      }

      const { data, error: fetchError } = await useFetch<ShippingCostResponse>(
        `${config.public.apiBase}/shipping/cost`,
        fetchOptions
      )

      if (fetchError.value) {
        console.error('Fetch error:', fetchError.value)
        throw fetchError.value
      }

      const responseData = data.value
      if (!responseData) {
        throw new Error('Tidak ada respons dari server')
      }

      // Check if response has error status
      if (responseData.meta && responseData.meta.code !== 200) {
        throw new Error(responseData.meta.message || 'API mengembalikan error')
      }

      if (!responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('Format respons ongkir tidak valid')
      }

      const results = responseData.data
      // Filter and sort results based on price preference
      let filteredResults = results.filter(item => 
        item.cost > 0 && item.code && item.service
      )

      if (payload.price === 'lowest') {
        filteredResults = filteredResults.sort((a, b) => a.cost - b.cost)
      } else if (payload.price === 'highest') {
        filteredResults = filteredResults.sort((a, b) => b.cost - a.cost)
      }

      costs.value = filteredResults
      return filteredResults
    }
    catch (err: any) {
      console.error('Gagal menghitung ongkir:', err)
      const errorMessage = err.message || err.data?.message || err.response?._data?.message || 'Terjadi kesalahan saat menghitung ongkir'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
    finally {
      loading.value = false
    }
  }

  const trackShipment = async (awb: string, courier: string): Promise<TrackingData> => {
    trackingLoading.value = true
    error.value = null

    try {
      // Input validation
      if (!awb || !courier) {
        throw new Error('AWB dan courier harus diisi')
      }

      if (awb.trim().length === 0 || courier.trim().length === 0) {
        throw new Error('AWB dan courier tidak boleh kosong')
      }

      console.log('Tracking shipment:', { awb, courier })

      const fetchOptions: UseFetchOptions<TrackingResponse> = {
        method: 'GET',
        headers: getAuthHeaders(),
        query: {
          awb: awb.trim(),
          courier: courier.trim(),
        },
        server: false, // Force client-side execution
        timeout: 30000, // 30 seconds timeout
        onRequest({ request, options }) {
          console.log('Making tracking request to:', request)
          console.log('Request options:', options)
        },
        onResponse({ response }) {
          console.log('Tracking response status:', response.status)
          console.log('Tracking response data:', response._data)
        },
        onResponseError({ response }) {
          console.error('Tracking API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            data: response._data,
            headers: response.headers
          })
          
          let errorMessage = 'Gagal melacak pengiriman'
          
          if (response.status === 400) {
            errorMessage = response._data?.message || 'Data yang dikirim tidak valid'
          } else if (response.status === 401) {
            errorMessage = 'Sesi telah berakhir, silakan login kembali'
          } else if (response.status === 404) {
            errorMessage = 'Data pengiriman tidak ditemukan'
          } else if (response.status === 422) {
            errorMessage = response._data?.message || 'Data validasi gagal'
          } else if (response.status === 500) {
            errorMessage = 'Terjadi kesalahan server'
          } else if (response.status === 0 || !response.status) {
            errorMessage = 'Tidak dapat terhubung ke server'
          }
          
          throw new Error(errorMessage)
        }
      }

      const { data, error: fetchError } = await useFetch<TrackingResponse>(
        `${config.public.apiBase}/shipping/track`,
        fetchOptions
      )

      if (fetchError.value) {
        console.error('Tracking fetch error:', fetchError.value)
        throw fetchError.value
      }

      const responseData = data.value
      if (!responseData) {
        throw new Error('Tidak ada respons dari server')
      }

      // Check if response has error status
      if (responseData.meta && responseData.meta.code !== 200) {
        throw new Error(responseData.meta.message || 'API mengembalikan error')
      }

      if (!responseData.data) {
        throw new Error('Format respons tracking tidak valid')
      }

      trackingData.value = responseData.data
      return responseData.data
    }
    catch (err: any) {
      console.error('Gagal melacak pengiriman:', err)
      const errorMessage = err.message || err.data?.message || err.response?._data?.message || 'Terjadi kesalahan saat melacak pengiriman'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
    finally {
      trackingLoading.value = false
    }
  }

  // Get origin ID from warehouse/store address
  const getOriginId = async (originAddress: any): Promise<number | null> => {
    try {
      const originDestination = await searchDestinationByAddress(originAddress)
      return originDestination?.id || null
    }
    catch (error) {
      console.error('Error getting origin ID:', error)
      return null
    }
  }

  // Helper function to get available couriers
  const getAvailableCouriers = () => {
    return [
      { code: 'jne', name: 'JNE' },
      { code: 'tiki', name: 'TIKI' },
    //   { code: 'sicepat', name: 'SiCepat' },
    //   { code: 'jnt', name: 'J&T Express' },
    //   { code: 'pos', name: 'Pos Indonesia' },
    //   { code: 'anteraja', name: 'AnterAja' },
    ]
  }

  // Helper function to clear data
  const clearData = () => {
    destinations.value = []
    costs.value = []
    trackingData.value = null
    error.value = null
  }

  // Helper function to format courier string
  const formatCourierString = (couriers: string[]) => {
    return couriers.join(':')
  }

  // Helper function to get tracking status color/badge
  const getTrackingStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes('delivered') || statusLower.includes('terkirim')) {
      return 'success'
    } else if (statusLower.includes('transit') || statusLower.includes('on the way')) {
      return 'info'
    } else if (statusLower.includes('failed') || statusLower.includes('gagal')) {
      return 'error'
    } else {
      return 'warning'
    }
  }

  // Helper function to format tracking date
  const formatTrackingDate = (date: string, time?: string) => {
    try {
      const dateObj = new Date(date + (time ? ` ${time}` : ''))
      return dateObj.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: time ? '2-digit' : undefined,
        minute: time ? '2-digit' : undefined,
      })
    } catch (error) {
      return `${date}${time ? ` ${time}` : ''}`
    }
  }

  return {
    // State
    destinations: readonly(destinations),
    costs: readonly(costs),
    trackingData: readonly(trackingData),
    loading: readonly(loading),
    searchLoading: readonly(searchLoading),
    trackingLoading: readonly(trackingLoading),
    error: readonly(error),

    // Methods
    fetchDestinations,
    searchDestinationByAddress,
    checkShippingCost,
    trackShipment,
    getOriginId,
    getAvailableCouriers,
    clearData,
    formatCourierString,
    getTrackingStatusColor,
    formatTrackingDate,
  }
}
