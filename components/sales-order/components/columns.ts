import type { ColumnDef } from '@tanstack/vue-table'

import type { Order } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
    accessorKey: 'customer.name',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Customer' }),
    cell: ({ row }) => {
      const customer = row.original.customer
      if (!customer) return h('div', {}, '-')
      
      // Generate initials for avatar fallback
      const initials = customer.name
        ?.split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
      
      // Generate random color using HSL for better UnoCSS compatibility
      const colors = [
        'hsl(0, 70%, 50%)',    // red
        'hsl(210, 70%, 50%)',  // blue
        'hsl(120, 70%, 45%)',  // green
        'hsl(45, 70%, 50%)',   // yellow
        'hsl(270, 70%, 50%)',  // purple
        'hsl(330, 70%, 50%)',  // pink
        'hsl(240, 70%, 50%)',  // indigo
        'hsl(180, 70%, 45%)',  // teal
        'hsl(30, 70%, 50%)',   // orange
        'hsl(190, 70%, 50%)',  // cyan
        'hsl(75, 70%, 45%)',   // lime
        'hsl(150, 70%, 45%)',  // emerald
        'hsl(350, 70%, 50%)',  // rose
        'hsl(260, 70%, 50%)',  // violet
        'hsl(200, 70%, 50%)',  // sky
        'hsl(40, 70%, 50%)',   // amber
      ]
      
      // Simple hash function to get consistent color for same name
      const hashCode = (str: string) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash)
      }
      
      const colorIndex = hashCode(customer.name || '') % colors.length
      const avatarColor = colors[colorIndex]
      
      return h('div', { class: 'flex items-center gap-3' }, [
        // Custom avatar bulat dengan background berwarna
        customer.avatar 
          ? h(Avatar, { class: 'h-8 w-8' }, [
              h(AvatarImage, { src: customer.avatar })
            ])
          : h('div', { 
              class: 'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white',
              style: { backgroundColor: avatarColor }
            }, initials),
        // Customer info
        h('div', { class: 'flex flex-col min-w-0' }, [
          h('div', { class: 'font-medium truncate' }, customer.name || '-'),
          h('div', { class: 'text-xs text-muted-foreground truncate' }, customer.phone || '-'),
          customer.npwp && h('div', { class: 'text-xs text-muted-foreground truncate' }, `NPWP: ${customer.npwp}`)
        ])
      ])
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = row.getValue<string>('status')
      
      // Status variant mapping
      const getStatusVariant = (status: string) => {
        const statusMap: Record<string, string> = {
          'completed': 'success',
          'success': 'success',
          'approved': 'success',
          'active': 'success',
          'paid': 'success',
          'delivered': 'success',
          'done': 'success',
          
          'pending': 'warning',
          'processing': 'warning',
          'review': 'warning',  
          'waiting': 'warning',
          'draft': 'warning',
          'in-progress': 'warning',
          
          'failed': 'error',
          'cancelled': 'error',
          'canceled': 'error',
          'rejected': 'error',
          'error': 'error',
          'expired': 'error',
          'declined': 'error',
          
          'new': 'info',
          'created': 'info',
          'submitted': 'info',
          'received': 'info',
        }
        
        return statusMap[status?.toLowerCase()] || 'default'
      }
      
      return h(Badge, { 
        variant: getStatusVariant(status),
        class: 'capitalize'
      }, status)
    },
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
    id: 'actions',
    cell: ({ row }) =>
      h(DataTableRowActions, { row }),
  },
]