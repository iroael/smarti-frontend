<script setup lang="ts">
import { columns } from '@/components/orders/components/columns'
import DataTable from '@/components/orders/components/DataTable.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSalesOrder } from '@/composables/useSalesOrder'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const {
  salesOrders,
  loading,
  fetchSalesOrders,
  error,
} = useSalesOrder()

onMounted(() => {
  fetchSalesOrders()
})

const goToCreate = () => {
  router.push('/orders/create')
}

// Computed untuk status statistics
const statusStats = computed(() => {
  if (!salesOrders.value || salesOrders.value.length === 0) {
    return {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      processing: 0
    }
  }

  const stats = salesOrders.value.reduce((acc, order) => {
    const status = order.status?.toLowerCase() || 'unknown'
    
    acc.total++
    
    // Group similar statuses
    if (['completed', 'success', 'approved', 'active', 'paid', 'delivered', 'done'].includes(status)) {
      acc.completed++
    } else if (['pending', 'review', 'waiting', 'draft'].includes(status)) {
      acc.pending++
    } else if (['processing', 'in-progress'].includes(status)) {
      acc.processing++
    } else if (['failed', 'cancelled', 'canceled', 'rejected', 'error', 'expired', 'declined'].includes(status)) {
      acc.cancelled++
    }
    
    return acc
  }, {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    processing: 0
  })

  return stats
})

// Total value calculation
const totalValue = computed(() => {
  if (!salesOrders.value || salesOrders.value.length === 0) return 0
  
  return salesOrders.value.reduce((sum, order) => {
    return sum + (parseFloat(order.total) || 0)
  }, 0)
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-6">
    <!-- Header Section -->
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Sales Order
        </h2>
        <p class="text-muted-foreground">
          Here's a list of your sales orders!
        </p>
      </div>

      <button
        @click="goToCreate"
        class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        + Add Sales Order
      </button>
    </div>

    <!-- Status Cards Section -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Orders Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m22 21-3-3 3-3" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ statusStats.total }}</div>
          <p class="text-xs text-muted-foreground">
            Rp {{ totalValue.toLocaleString('id-ID') }}
          </p>
        </CardContent>
      </Card>

      <!-- Pending Orders Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending</CardTitle>
          <Badge variant="warning" class="text-xs">{{ statusStats.pending }}</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-amber-600">{{ statusStats.pending }}</div>
          <p class="text-xs text-muted-foreground">
            {{ statusStats.total > 0 ? Math.round((statusStats.pending / statusStats.total) * 100) : 0 }}% of total
          </p>
        </CardContent>
      </Card>

      <!-- Processing Orders Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Processing</CardTitle>
          <Badge variant="info" class="text-xs">{{ statusStats.processing }}</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">{{ statusStats.processing }}</div>
          <p class="text-xs text-muted-foreground">
            {{ statusStats.total > 0 ? Math.round((statusStats.processing / statusStats.total) * 100) : 0 }}% of total
          </p>
        </CardContent>
      </Card>

      <!-- Completed Orders Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Completed</CardTitle>
          <Badge variant="success" class="text-xs">{{ statusStats.completed }}</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-emerald-600">{{ statusStats.completed }}</div>
          <p class="text-xs text-muted-foreground">
            {{ statusStats.total > 0 ? Math.round((statusStats.completed / statusStats.total) * 100) : 0 }}% of total
          </p>
        </CardContent>
      </Card>

      <!-- Cancelled Orders Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Cancelled</CardTitle>
          <Badge variant="error" class="text-xs">{{ statusStats.cancelled }}</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{{ statusStats.cancelled }}</div>
          <p class="text-xs text-muted-foreground">
            {{ statusStats.total > 0 ? Math.round((statusStats.cancelled / statusStats.total) * 100) : 0 }}% of total
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="text-muted-foreground">Loading...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ error.message }}</div>
    
    <!-- Data Table -->
    <DataTable v-else :data="salesOrders" :columns="columns" />
  </div>
</template>

<style scoped>
</style>