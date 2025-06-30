<script setup lang="ts">
import { columns } from '@/components/tax/components/columns'
import DataTable from '@/components/tax/components/DataTable.vue'
import { useProductTax } from '@/composables/useProductTax'
import { onMounted } from 'vue'

const { taxes, fetchTaxes, loading } = useProductTax()

onMounted(async () => {
  await fetchTaxes()
  console.log('Daftar pajak:', taxes.value)
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Taxes</h2>
        <p class="text-muted-foreground">
          Here's a list of your taxes!
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-muted-foreground">Loading taxes...</div>
    <DataTable v-else :data="taxes" :columns="columns" />
  </div>
</template>
