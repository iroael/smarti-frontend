<script setup lang="ts">
import { columns } from '@/components/purchase/components/columns'
import DataTable from '@/components/purchase/components/DataTable.vue'
import tasks from '@/components/purchase/data/purchase.json'
import { Plus } from 'lucide-vue-next'
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Purchase Orders
        </h2>
        <p class="text-muted-foreground">
          Here&apos;s a list of your purchase orders for this month!
        </p>
      </div>
      
      <!-- Create Button -->
      <div class="flex items-center gap-2">
        <NuxtLink 
          to="/purchase/create"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Plus class="h-4 w-4" />
          Create Purchase Order
        </NuxtLink>
      </div>
    </div>
    
    <DataTable :data="tasks.data" :columns="columns" />
  </div>
</template>

<style scoped>
</style>