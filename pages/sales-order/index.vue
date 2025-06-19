<script setup lang="ts">
import { columns } from '@/components/sales-order/components/columns'
import DataTable from '@/components/sales-order/components/DataTable.vue'
import { useSalesOrder } from '@/composables/useSalesOrder'
import { onMounted } from 'vue'
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
  router.push('/sales-order/create')
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Sales Order
        </h2>
        <p class="text-muted-foreground">
          Here's a list of your sales orders!
        </p>
      </div>

      <!-- ✅ Add button to go to form page -->
      <button
        @click="goToCreate"
        class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        + Add Sales Order
      </button>
    </div>

    <div v-if="loading" class="text-muted-foreground">Loading...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ error.message }}</div>
    <DataTable v-else :data="salesOrders" :columns="columns" />
  </div>
</template>

<style scoped>
</style>
