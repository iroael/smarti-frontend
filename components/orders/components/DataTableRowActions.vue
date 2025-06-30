<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Order } from '../data/schema'
import { computed } from 'vue'
import { labels } from '../data/data'
import { orderSchema } from '../data/schema'
import { useRouter } from 'vue-router' // or 'nuxt/app' in Nuxt 3

const router = useRouter()

interface DataTableRowActionsProps {
  row: Row<Order>
}
const props = defineProps<DataTableRowActionsProps>()

// ✅ PERBAIKAN: Gunakan safeParseOrder untuk handle missing fields
const order = computed(() => {
  const originalData = props.row.original
  
  // Coba parse dengan orderSchema dulu
  const result = orderSchema.safeParse(originalData)
  
  if (result.success) {
    return result.data
  } else {
    // Jika gagal, kembalikan data original untuk akses id
    console.warn('Order validation failed, using original data:', result.error.issues)
    return originalData
  }
})

const goToDetail = () => {
  // Gunakan id dari data yang ada
  const orderId = order.value.id
  if (orderId) {
    router.push(`/orders/details/${orderId}`)
  } else {
    console.error('No order ID found')
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="h-8 w-8 flex p-0 data-[state=open]:bg-muted"
      >
        <Icon name="i-radix-icons-dots-horizontal" class="h-4 w-4" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[160px]">
      <DropdownMenuItem @click="goToDetail">View</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>