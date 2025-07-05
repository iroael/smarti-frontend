<script setup lang="ts">
import { columns } from '@/components/orders/components/columns'
import DataTable from '@/components/orders/components/DataTable.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSalesOrder } from '@/composables/useSalesOrder'
import { computed, onMounted } from 'vue'

const {
  salesOrders,
  loading,
  error,
  fetchIncomingOrders,
} = useSalesOrder()

onMounted(() => {
  fetchIncomingOrders()
})

const statusStats = computed(() => {
  const stats = {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    processing: 0
  }

  for (const order of salesOrders.value) {
    const status = order.status?.toLowerCase() || 'unknown'
    stats.total++

    if (['completed', 'success', 'approved', 'active', 'paid', 'delivered', 'done'].includes(status)) {
      stats.completed++
    } else if (['pending', 'review', 'waiting', 'draft'].includes(status)) {
      stats.pending++
    } else if (['processing', 'in-progress'].includes(status)) {
      stats.processing++
    } else if (['failed', 'cancelled', 'canceled', 'rejected', 'error', 'expired', 'declined'].includes(status)) {
      stats.cancelled++
    }
  }

  return stats
})

const totalValue = computed(() => {
  return salesOrders.value.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0)
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-6">
    <div>
      <h2 class="text-2xl font-bold">Pesanan Masuk</h2>
      <p class="text-muted-foreground">Daftar Pesanan masuk anda</p>
    </div>

    <!-- Status Summary Cards -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ statusStats.total }}</div>
          <p class="text-xs text-muted-foreground">Rp {{ totalValue.toLocaleString('id-ID') }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-amber-600">{{ statusStats.pending }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-blue-600">{{ statusStats.processing }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-green-600">{{ statusStats.completed }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Cancelled</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold text-red-600">{{ statusStats.cancelled }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading/Error State -->
    <div v-if="loading" class="text-muted-foreground">Loading incoming orders...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ error.message }}</div>

    <!-- Data Table -->
    <DataTable v-else :data="salesOrders" :columns="columns" />
  </div>
</template>
