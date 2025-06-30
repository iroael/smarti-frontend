<script setup lang="ts">
import type { TrackingData, TrackingManifest } from '@/types/shipping'
import { useShipping } from '~/composables/useShipping'

const props = defineProps<{
  shipping: {
    id: number
    courierName: string
    trackingNumber: string
    shippingStatus: string
    shippedAt: string
    deliveredAt: string
  }
}>()

const emit = defineEmits(['refresh'])

const { trackShipment, formatTrackingDate } = useShipping()

// Local state
const trackingInfo = ref<TrackingData | null>(null)
const loading = ref(false)
const localError = ref<string | null>(null)
const showFullTracking = ref(false)

// Fetch tracking data
const fetchTracking = async () => {
  try {
    loading.value = true
    localError.value = null
    
    if (!props.shipping.trackingNumber || !props.shipping.courierName) {
      throw new Error('Nomor resi atau kurir tidak tersedia')
    }

    const data = await trackShipment(props.shipping.trackingNumber, props.shipping.courierName)
    trackingInfo.value = data
  } catch (err: any) {
    console.error('Failed to fetch tracking:', err)
    localError.value = err.message || 'Gagal memuat data tracking'
  } finally {
    loading.value = false
  }
}

// Watch for shipping prop changes
watch(() => props.shipping, (newVal) => {
  if (newVal.trackingNumber && newVal.courierName) {
    fetchTracking()
  }
}, { immediate: true })

// Format manifest date for display
const formatManifestDate = (manifest: TrackingManifest) => {
  return formatTrackingDate(manifest.manifest_date, manifest.manifest_time)
}

// Get status text and color based on shipping status
const getStatusConfig = (status: string) => {
  const statusConfigs: Record<string, { text: string; color: string; bgColor: string; icon: string }> = {
    'pending': { 
      text: 'Menunggu Pengiriman', 
      color: 'text-yellow-800', 
      bgColor: 'bg-yellow-100',
      icon: '⏳'
    },
    'shipped': { 
      text: 'Dalam Pengiriman', 
      color: 'text-blue-800', 
      bgColor: 'bg-blue-100',
      icon: '🚚'
    },
    'delivered': { 
      text: 'Terkirim', 
      color: 'text-green-800', 
      bgColor: 'bg-green-100',
      icon: '✅'
    },
    'failed': { 
      text: 'Gagal Kirim', 
      color: 'text-red-800', 
      bgColor: 'bg-red-100',
      icon: '❌'
    },
    'returned': { 
      text: 'Dikembalikan', 
      color: 'text-gray-800', 
      bgColor: 'bg-gray-100',
      icon: '↩️'
    }
  }
  return statusConfigs[status.toLowerCase()] || { 
    text: status, 
    color: 'text-gray-800', 
    bgColor: 'bg-gray-100',
    icon: '📦'
  }
}

// Get progress percentage based on status
const getProgressPercentage = (status: string) => {
  const progressMap: Record<string, number> = {
    'pending': 10,
    'shipped': 60,
    'delivered': 100,
    'failed': 0,
    'returned': 0
  }
  return progressMap[status.toLowerCase()] || 0
}

// Copy tracking number to clipboard
const copyTrackingNumber = async () => {
  try {
    await navigator.clipboard.writeText(props.shipping.trackingNumber)
    // You might want to show a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Get courier logo/icon
const getCourierIcon = (courier: string) => {
  const courierIcons: Record<string, string> = {
    'jne': '🟡',
    'pos': '🔴',
    'tiki': '🟢',
    'jnt': '🔵',
    'sicepat': '🟣',
    'anteraja': '🟠',
    'wahana': '🟤'
  }
  return courierIcons[courier.toLowerCase()] || '📦'
}

// Format estimated delivery
const formatEstimatedDelivery = (shippedDate: string) => {
  if (!shippedDate) return null
  const shipped = new Date(shippedDate)
  const estimated = new Date(shipped.getTime() + (3 * 24 * 60 * 60 * 1000)) // +3 days
  return estimated.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<template>
  <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Tracking Pengiriman</h3>
            <p class="text-sm text-gray-600">Lacak status paket Anda secara real-time</p>
          </div>
        </div>
        <button 
          @click="fetchTracking"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          :disabled="loading"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 text-gray-600" 
            :class="{ 'animate-spin': loading }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="text-sm font-medium text-gray-700">{{ loading ? 'Memuat...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Shipping Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-600 font-medium">Kurir</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-2xl">{{ getCourierIcon(shipping.courierName) }}</span>
                <p class="font-bold text-blue-900">{{ shipping.courierName.toUpperCase() }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div>
            <p class="text-sm text-purple-600 font-medium">Nomor Resi</p>
            <div class="flex items-center gap-2 mt-1">
              <p class="font-bold text-purple-900 flex-1">{{ shipping.trackingNumber }}</p>
              <button 
                @click="copyTrackingNumber"
                class="p-1 hover:bg-purple-200 rounded transition-colors"
                title="Salin nomor resi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div>
            <p class="text-sm text-green-600 font-medium">Status</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xl">{{ getStatusConfig(shipping.shippingStatus).icon }}</span>
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                :class="`${getStatusConfig(shipping.shippingStatus).bgColor} ${getStatusConfig(shipping.shippingStatus).color}`"
              >
                {{ getStatusConfig(shipping.shippingStatus).text }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estimated Delivery -->
      <div v-if="shipping.shippedAt && shipping.shippingStatus !== 'delivered'" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-amber-700 font-medium">Estimasi Tiba</p>
            <p class="text-amber-900 font-semibold">{{ formatEstimatedDelivery(shipping.shippedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <p class="text-gray-600 text-sm">Memuat informasi tracking...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="localError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="p-1 bg-red-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-red-800 font-medium">Gagal memuat data</p>
            <p class="text-red-700 text-sm mt-1">{{ localError }}</p>
            <button 
              @click="fetchTracking"
              class="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>

      <!-- Tracking Info -->
      <div v-else-if="trackingInfo" class="space-y-6">
        <!-- Shipping Details -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h4 class="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Detail Pengiriman
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-800">Pengirim</p>
                  <p class="font-bold text-gray-900">{{ trackingInfo.details.shipper_name }}</p>
                  <p class="text-sm text-gray-600">{{ trackingInfo.details.shipper_city }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-800">Penerima</p>
                  <p class="font-bold text-gray-900">{{ trackingInfo.details.receiver_name }}</p>
                  <p class="text-sm text-gray-600">{{ trackingInfo.details.receiver_city }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat Pengiriman
            </h4>
            <button 
              @click="showFullTracking = !showFullTracking"
              class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {{ showFullTracking ? 'Sembunyikan Detail' : 'Tampilkan Semua' }}
            </button>
          </div>

          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-indigo-500 to-gray-300"></div>

            <ul class="space-y-6">
              <li 
                v-for="(manifest, index) in (showFullTracking ? trackingInfo.manifest : trackingInfo.manifest.slice(0, 3))" 
                :key="index"
                class="relative pl-12"
              >
                <!-- Timeline dot -->
                <div class="absolute left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg border-4"
                     :class="{
                       'border-green-500 bg-green-50': index === 0,
                       'border-indigo-500 bg-indigo-50': index > 0 && index < 2,
                       'border-gray-400 bg-gray-50': index >= 2
                     }">
                  <div 
                    class="h-2 w-2 rounded-full" 
                    :class="{
                      'bg-green-500': index === 0,
                      'bg-indigo-500': index > 0 && index < 2,
                      'bg-gray-400': index >= 2
                    }"
                  ></div>
                </div>

                <!-- Timeline content -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-gray-900">{{ manifest.city_name }}</p>
                        <span 
                          v-if="index === 0" 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          Terbaru
                        </span>
                      </div>
                      <p class="text-sm text-gray-700 mb-2">{{ manifest.manifest_description }}</p>
                      <p class="text-xs text-gray-500 font-medium">{{ formatManifestDate(manifest) }}</p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <!-- Show more indicator -->
            <div v-if="!showFullTracking && trackingInfo.manifest.length > 3" class="text-center mt-4">
              <button 
                @click="showFullTracking = true"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                Tampilkan {{ trackingInfo.manifest.length - 3 }} riwayat lainnya
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Tidak ada data tracking tersedia</p>
        <p class="text-gray-400 text-sm mt-1">Coba refresh untuk memuat ulang data</p>
      </div>
    </div>
  </div>
</template>