// baseColumns.ts
import { h } from 'vue'
import { ColumnDef } from '@tanstack/vue-table'
import { Order } from '../data/schema'
import DataTableColumnHeader from '../components/DataTableColumnHeader.vue';

export const orderInfoColumn: ColumnDef<Order> = {
  id: 'orderInfo',
  header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Order Info' }),
  cell: ({ row }) => {
    const { orderNumber, orderDate } = row.original
    const formattedDate = new Date(orderDate).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
    return h('div', { class: 'flex flex-col gap-1' }, [
      h('div', { class: 'font-medium text-sm' }, orderNumber),
      h('div', { class: 'text-xs text-muted-foreground' }, formattedDate)
    ])
  }
}

export const productInfoColumn: ColumnDef<Order> = {
  id: 'productInfo',
  header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Product Info' }),
  cell: ({ row }) => {
    const items = row.original.items || []
    return h('div', { class: 'flex flex-col gap-2' }, items.map(item =>
      h('div', { class: 'flex flex-col text-sm text-muted-foreground' }, [
        h('div', { class: 'font-medium' }, item.product?.product_code || '-'),
        h('div', {}, item.product?.name || '-')
      ])
    ))
  }
}
