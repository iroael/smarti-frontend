import type { ColumnDef } from '@tanstack/vue-table'
import type { PurchaseOrder } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import {
  purchaseOrderLabels,
  purchaseOrderStatuses,
} from '../data/data'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'
// import { Icon } from '@/components/ui/'

// Currency formatter utility
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'checked': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
      'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Select all',
      'class': 'translate-y-0.5',
    }),
    cell: ({ row }) => h(Checkbox, { 
      'checked': row.getIsSelected(), 
      'onUpdate:checked': value => row.toggleSelected(!!value), 
      'ariaLabel': 'Select row', 
      'class': 'translate-y-0.5' 
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'poNumber',
    header: ({ column }) => h(DataTableColumnHeader, { 
      column, 
      title: 'PO Number',
      class: 'w-[120px]'
    }),
    cell: ({ row }) => h('div', { class: 'font-mono font-medium text-sm' }, row.getValue('poNumber')),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => h(DataTableColumnHeader, { 
      column, 
      title: 'Supplier',
      class: 'min-w-[180px]'
    }),
    cell: ({ row }) => {
      const supplier = row.original.supplier
      return h('div', { class: 'flex items-center gap-2' }, [
        // h(Icon, { name: 'i-radix-icons-building', class: 'h-4 w-4 opacity-70' }),
        h('span', { class: 'truncate max-w-[160px]' }, supplier.name)
      ])
    },
    filterFn: (row, id, value) => {
      return row.original.supplier.name.toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'orderDate',
    header: ({ column }) => h(DataTableColumnHeader, { 
      column, 
      title: 'Order Date',
      class: 'w-[120px]'
    }),
    cell: ({ row }) => {
      const date = new Date(row.getValue('orderDate'))
      return h('div', { class: 'text-sm' }, 
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      )
    },
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader, { 
      column, 
      title: 'Status',
      class: 'w-[140px]'
    }),
    cell: ({ row }) => {
      const status = purchaseOrderStatuses.find(
        status => status.value === row.getValue('status')
      )

      if (!status) return null

      return h('div', { class: 'flex items-center gap-2' }, [
        h(status.icon, { class: 'h-4 w-4' }),
        h('span', status.label)
      ])
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => h(DataTableColumnHeader, { 
      column, 
      title: 'Total',
      class: 'w-[140px] text-right'
    }),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total'))
      return h('div', { class: 'text-right font-medium' }, 
        formatCurrency(amount)
      )
    },
    sortingFn: 'basic',
  },
  {
    accessorKey: 'items',
    header: ({ column }) => h(DataTableColumnHeader, { 
      column, 
      title: 'Items',
      class: 'w-[120px]'
    }),
    cell: ({ row }) => {
      const items = row.original.items
      const firstItemCategory = items[0]?.productName.includes('Material') ? 'raw_material' : 
                             items[0]?.productName.includes('Supply') ? 'office_supply' : 
                             'equipment'
      const label = purchaseOrderLabels.find(label => label.value === firstItemCategory)
      
      return h('div', { class: 'flex gap-2 items-center' }, [
        label ? h(Badge, { 
          variant: 'outline',
          class: 'text-xs capitalize'
        }, () => label.label) : null,
        h('span', { class: 'text-sm' }, `${items.length} ${items.length === 1 ? 'item' : 'items'}`)
      ])
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
