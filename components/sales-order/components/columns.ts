import type { ColumnDef } from '@tanstack/vue-table'

import type { Order } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import { labels, priorities, statuses } from '../data/data'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all',
        class: 'translate-y-0.5',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': value => row.toggleSelected(!!value),
        ariaLabel: 'Select row',
        class: 'translate-y-0.5',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderNumber',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Order #' }),
    cell: ({ row }) =>
      h('div', { class: 'font-medium' }, row.getValue('orderNumber')),
  },
  {
    accessorKey: 'orderDate',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Date' }),
    cell: ({ row }) => {
      const rawDate = row.getValue<string>('orderDate')
      const formatted = new Date(rawDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      return h('div', {}, formatted)
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) =>
      h('span', { class: 'capitalize' }, row.getValue('status')),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'total',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Total' }),
    cell: ({ row }) => {
      const val = parseFloat(row.getValue('total'))
      return h('div', {}, `Rp ${val.toLocaleString('id-ID')}`)
    },
  },
  {
    accessorKey: 'customer.name',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Customer' }),
    cell: ({ row }) =>
      h('div', { class: 'truncate' }, row.original.customer?.name || '-'),
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h(DataTableRowActions, { row }),
  },
]
