import type { ColumnDef } from '@tanstack/vue-table'

import type { Supplier } from '../data/schema'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns = (onDeleteSuccess: () => void): ColumnDef<Supplier>[] => [
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
    accessorKey: 'id',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'ID' }),
    cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('id')),
    enableSorting: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Nama Supplier' }),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Email' }),
    cell: ({ row }) => h('div', {}, row.getValue('email')),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Telepon' }),
    cell: ({ row }) => h('div', {}, row.getValue('phone')),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Alamat' }),
    cell: ({ row }) =>
      h('div', { class: 'max-w-[300px] truncate text-muted-foreground' }, row.getValue('address')),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Tanggal Buat' }),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return h('div', {}, date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }))
    },
  },
  {
    id: 'actions',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Action' }),
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
  },
]
