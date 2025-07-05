<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { PurchaseOrder } from '../data/schema'
import { computed } from 'vue'
// import { labels } from '../data/data'
import { purchaseOrdersSchema } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<PurchaseOrder>
}
const props = defineProps<DataTableRowActionsProps>()

const task = computed(() => purchaseOrdersSchema.parse(props.row.original))
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
      <DropdownMenuItem>Edit</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        Delete
        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
