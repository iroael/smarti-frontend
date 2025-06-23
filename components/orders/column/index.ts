// columns/index.ts
import type { ColumnDef } from '@tanstack/vue-table'
import type { Order } from '../data/schema'
import { h } from 'vue'
import DataTableRowActions from '../components/DataTableRowActions.vue'
import { orderInfoColumn, productInfoColumn } from './baseColumn'
import { getPartyColumn } from './partyColumn'
import { quantityColumn } from './quantityColumn'
import { statusColumn } from './statusColumn'

export function getOrderColumns(partyType: 'customer' | 'supplier'): ColumnDef<Order>[] {
  return [
    orderInfoColumn,
    productInfoColumn,
    getPartyColumn(partyType),
    quantityColumn,
    statusColumn,
    {
      accessorKey: 'total',
      header: () => 'Total',
      cell: ({ row }) => {
        const val = parseFloat(row.getValue('total'))
        return `Rp ${val.toLocaleString('id-ID')}`
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => h(DataTableRowActions, { row })
    }
  ]
}
