<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Tax } from '../data/schema'
import { computed } from 'vue'
import { taxTypes } from '../data/data'
import { taxSchema } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Tax>
}
const props = defineProps<DataTableRowActionsProps>()

const tax = computed(() => taxSchema.parse(props.row.original))
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

    <DropdownMenuContent align="end" class="w-[180px]">
      <DropdownMenuItem>Edit</DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Jenis Pajak</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup :value="tax.label">
            <DropdownMenuRadioItem
              v-for="type in taxTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />

      <DropdownMenuItem class="text-red-600">
        Delete
        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
