import type { ColumnDef } from '@tanstack/vue-table'
import type { Customer } from '../data/schema'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns: ColumnDef<Customer>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        'checked': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:checked': value => table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all',
        'class': 'translate-y-0.5',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        'checked': row.getIsSelected(),
        'onUpdate:checked': value => row.toggleSelected(!!value),
        'ariaLabel': 'Select row',
        'class': 'translate-y-0.5',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Name' }),
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Email' }),
    cell: ({ row }) => h('span', {}, row.getValue('email')),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Phone' }),
    cell: ({ row }) => h('span', {}, row.getValue('phone')),
  },
  {
    accessorKey: 'npwp',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'NPWP' }),
    cell: ({ row }) => h('span', {}, row.getValue('npwp')),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Address' }),
    cell: ({ row }) => h('span', {}, row.getValue('address')),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Created At' }),
    cell: ({ row }) =>
      h('span', {}, new Date(row.getValue('createdAt')).toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
      })),
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
