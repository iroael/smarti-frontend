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

const order = computed(() => orderSchema.parse(props.row.original))
const goToDetail = () => {
  router.push(`/sales-order/details/${order.value.id}`)
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
