import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Order } from '../data/schema'
import DataTableColumnHeader from '../components/DataTableColumnHeader.vue'

export const quantityColumn: ColumnDef<Order> = {
  id: 'quantity',
  header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Qty' }),
  cell: ({ row }) => {
    const items = row.original.items || []
    if (!items.length) return h('div', { class: 'text-muted-foreground text-sm' }, '-')
    return h('ul', { class: 'list-disc list-inside text-sm space-y-0.5' }, items.map(item =>
      h('li', {}, `${item.quantity}`)
    ))
  }
}
