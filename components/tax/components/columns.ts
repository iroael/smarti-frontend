import type { ColumnDef } from '@tanstack/vue-table'

import type { Tax } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import { labels, statuses } from '../data/data'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns: ColumnDef<Tax>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Name' }),
    cell: ({ row }) => h('div', {}, row.getValue('name')),
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Rate (%)' }),
    cell: ({ row }) => h('div', {}, row.getValue('rate')),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Description' }),
    cell: ({ row }) => h('div', {}, row.getValue('description') ?? '-'),
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Active' }),
    cell: ({ row }) =>
      h('span', {}, row.getValue('is_active') ? '✅ Yes' : '❌ No'),
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
