// columns.ts
import type { ColumnDef } from '@tanstack/vue-table'
import type { Product } from '@/types/schema'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'
import { Badge } from '@/components/ui/badge'

export const columns = (onDeleteSuccess: () => void): ColumnDef<Product>[] => [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all',
        class: 'translate-y-0.5',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': value => row.toggleSelected(!!value),
        'ariaLabel': 'Select row',
        class: 'translate-y-0.5',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'ID' }),
    cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Product Name' }),
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Description' }),
    cell: ({ row }) => h('div', { class: 'truncate max-w-[400px]' }, row.getValue('description')),
  },
  {
    id: 'price',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Price' }),
    cell: ({ row }) => {
      const product = row.original
      const price = parseFloat(product.prices?.[0]?.h_jual_b || '0').toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
      })
      return h('span', price)
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Stock' }),
    cell: ({ row }) => h('span', {}, row.getValue('stock')),
  },
  {
    accessorKey: 'is_bundle',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Bundle?' }),
    cell: ({ row }) => {
      const isBundle = row.getValue('is_bundle')
      return h(Badge, {
        variant: isBundle ? 'default' : 'outline',
      }, () => isBundle ? 'Yes' : 'No')
    },
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
  },
]
