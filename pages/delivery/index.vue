<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { columns } from '@/components/delivery/components/columns'
import DataTable from '@/components/delivery/components/DataTable.vue'
import { useDelivery } from '@/composables/useDelivery'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, Truck, AlertCircle } from 'lucide-vue-next'

// Use the delivery composable
const { 
  delivery, 
  loading, 
  fetchDelivery,
  error 
} = useDelivery()

// Computed untuk statistik
const stats = computed(() => {
  if (!delivery.value.length) return { total: 0, pending: 0, delivered: 0, shipped: 0 }
  
  return {
    total: delivery.value.length,
    pending: delivery.value.filter(d => d.shippingStatus === 'pending').length,
    shipped: delivery.value.filter(d => d.shippingStatus === 'shipped').length,
    delivered: delivery.value.filter(d => d.shippingStatus === 'delivered').length,
  }
})

// Fetch data saat component mounted
onMounted(async () => {
  try {
    await fetchDelivery()
  } catch (err) {
    console.error('Error fetching delivery data:', err)
  }
})

// Function untuk refresh data
const refreshData = async () => {
  try {
    await fetchDelivery()
  } catch (err) {
    console.error('Error refreshing delivery data:', err)
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- Header Section -->
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Pengiriman
        </h2>
        <p class="text-muted-foreground">
          Kelola dan pantau status pengiriman pesanan Anda
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw :class="['h-4 w-4', loading && 'animate-spin']" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Truck class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Total Pengiriman</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <div class="w-5 h-5 bg-yellow-500 rounded-full"></div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <div class="w-5 h-5 bg-blue-500 rounded-full"></div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Dikirim</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats.shipped }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <div class="w-5 h-5 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600">Terkirim</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.delivered }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>

    <!-- Loading Skeleton -->
    <div v-if="loading && !delivery.length" class="space-y-4">
      <div class="flex items-center space-x-4">
        <Skeleton class="h-12 w-12 rounded-full" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton class="h-[400px] w-full" />
    </div>

    <!-- Data Table -->
    <div v-else>
      <DataTable 
        :data="delivery" 
        :columns="columns" 
        :loading="loading"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !delivery.length" class="text-center py-12">
      <Truck class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-semibold text-gray-900">Tidak ada data pengiriman</h3>
      <p class="mt-1 text-sm text-gray-500">Belum ada pengiriman yang terdaftar dalam sistem.</p>
      <div class="mt-6">
        <button 
          @click="refreshData"
          class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <RefreshCw class="-ml-0.5 mr-1.5 h-4 w-4" />
          Refresh Data
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles jika diperlukan */
</style>