import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Order } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import DataTableColumnHeader from '../components/DataTableColumnHeader.vue'

export const statusColumn: ColumnDef<Order> = {
  accessorKey: 'status',
  header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Status' }),
  cell: ({ row }) => {
    const status = row.getValue<string>('status')
    const variant = getStatusVariant(status)

    return h(Badge, { variant, class: 'capitalize' }, status)
  },
  filterFn: (row, id, value) => value.includes(row.getValue(id))
}

function getStatusVariant(status: string) {
  const s = status?.toLowerCase()
  if (['completed', 'approved', 'delivered'].includes(s)) return 'success'
  if (['pending', 'waiting', 'draft'].includes(s)) return 'warning'
  if (['cancelled', 'rejected', 'error'].includes(s)) return 'error'
  if (['new', 'created'].includes(s)) return 'info'
  return 'default'
}
