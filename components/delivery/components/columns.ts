import type { ColumnDef } from '@tanstack/vue-table'
import type { Shipping } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import { Truck, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

// Status mapping dengan icon dan warna
const shippingStatuses = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-blue-500' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
  { value: 'returned', label: 'Returned', icon: AlertCircle, color: 'bg-orange-500' },
]

// Courier mapping dengan warna badge
const courierMapping = {
  'jne': { name: 'JNE', variant: 'default' as const },
  'pos': { name: 'POS Indonesia', variant: 'secondary' as const },
  'tiki': { name: 'TIKI', variant: 'outline' as const },
  'sicepat': { name: 'SiCepat', variant: 'destructive' as const },
  'jnt': { name: 'J&T Express', variant: 'default' as const },
  'anteraja': { name: 'AnterAja', variant: 'secondary' as const },
}

// Format currency helper
const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(amount))
}

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const columns: ColumnDef<Shipping>[] = [
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
    id: 'courier-tracking',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Kurir & Tracking' }),
    cell: ({ row }) => {
      const courierName = row.original.courierName.toLowerCase()
      const courier = courierMapping[courierName as keyof typeof courierMapping] || { name: row.original.courierName.toUpperCase(), variant: 'outline' as const }
      
      return h('div', { class: 'space-y-1' }, [
        h(Badge, { variant: courier.variant, class: 'text-xs' }, () => courier.name),
        h('div', { class: 'font-mono text-sm text-muted-foreground' }, row.original.trackingNumber),
      ])
    },
    enableSorting: false,
  },
  {
    id: 'order-info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Order' }),
    accessorFn: (row) => row.order.orderNumber,
    cell: ({ row }) => {
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'font-medium text-sm' }, row.original.order.orderNumber),
        h('div', { class: 'text-xs text-muted-foreground' }, formatDate(row.original.order.orderDate)),
      ])
    },
  },
  {
    id: 'customer',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Customer' }),
    accessorFn: (row) => row.order.customer.name,
    cell: ({ row }) => {
      const customer = row.original.order.customer
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'font-medium text-sm max-w-[200px] truncate' }, customer.name),
        h('div', { class: 'text-xs text-muted-foreground' }, `${customer.city}, ${customer.province}`),
      ])
    },
  },
  {
    accessorKey: 'shippingStatus',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = shippingStatuses.find(
        status => status.value === row.getValue('shippingStatus')
      )

      if (!status) return null

      return h('div', { class: 'flex items-center space-x-2' }, [
        h('div', { class: `w-2 h-2 rounded-full ${status.color}` }),
        h('span', { class: 'text-sm' }, status.label),
      ])
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'shipping-dates',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Tanggal Pengiriman' }),
    cell: ({ row }) => {
      const shipping = row.original
      return h('div', { class: 'space-y-1 text-xs' }, [
        h('div', { class: 'flex items-center space-x-1' }, [
          h('span', { class: 'text-muted-foreground' }, 'Dikirim:'),
          h('span', formatDateTime(shipping.shippedAt)),
        ]),
        h('div', { class: 'flex items-center space-x-1' }, [
          h('span', { class: 'text-muted-foreground' }, 'Sampai:'),
          h('span', formatDateTime(shipping.deliveredAt)),
        ]),
      ])
    },
  },
  {
    id: 'order-value',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Nilai Order' }),
    accessorFn: (row) => parseFloat(row.order.total),
    cell: ({ row }) => {
      const order = row.original.order
      return h('div', { class: 'space-y-1 text-right' }, [
        h('div', { class: 'font-medium text-sm' }, formatCurrency(order.total)),
        h('div', { class: 'text-xs text-muted-foreground' }, `+ ${formatCurrency(order.shippingCost)} ongkir`),
      ])
    },
  },
  {
    id: 'supplier',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Supplier' }),
    accessorFn: (row) => row.order.supplier.name,
    cell: ({ row }) => {
      const supplier = row.original.order.supplier
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'font-medium text-sm max-w-[150px] truncate' }, supplier.name),
        h(Badge, { variant: 'secondary', class: 'text-xs' }, () => supplier.supplier_code),
      ])
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
