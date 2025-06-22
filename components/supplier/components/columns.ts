import type { ColumnDef } from '@tanstack/vue-table'

import type { Supplier } from '../data/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

// Function to generate consistent colors based on supplier name
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ]
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

// Function to get initials from supplier name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Function to generate random avatar URL
const getRandomAvatar = (name: string, id: number): string => {
  // Option 1: DiceBear API (various styles)
  const styles = ['avataaars', 'bottts', 'identicon', 'initials', 'personas', 'pixel-art']
  const style = styles[id % styles.length]
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}`
  
  // Option 2: Gravatar with fallback
  // const hash = btoa(name + id).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  // return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=40`
  
  // Option 3: UI Avatars
  // return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=40`
}

// Function to format phone number
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '-'
  // Simple Indonesian phone number formatting
  if (phone.startsWith('08')) {
    return phone.replace(/(\d{2})(\d{3,4})(\d{3,4})(\d{3,4})/, '$1-$2-$3-$4')
  }
  return phone
}

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
    id: 'supplier_info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Supplier Information' }),
    cell: ({ row }) => {
      const supplier = row.original
      const name = supplier.name || '-'
      const supplierCode = supplier.supplier_code || '-'
      const email = supplier.email || '-'
      const initials = getInitials(name)
      const avatarColor = getAvatarColor(name)
      
      return h('div', { class: 'flex items-center gap-3 max-w-[320px]' }, [
        // Avatar with random image and initials fallback
        h(Avatar, { class: 'h-9 w-9 flex-shrink-0' }, [
          h(AvatarImage, { 
            src: getRandomAvatar(name, supplier.id),
            alt: name
          }),
          h(AvatarFallback, { 
            class: `${avatarColor} text-white text-xs font-semibold`
          }, initials)
        ]),
        h('div', { class: 'space-y-1 min-w-0 flex-1' }, [
          // Supplier Code with enhanced styling
          h('div', { class: 'flex items-center gap-2' }, [
            h(Badge, { 
              variant: 'secondary',
              class: 'text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5'
            }, supplierCode),
          ]),
          // Supplier Name
          h('div', { 
            class: 'font-semibold text-sm text-gray-900 truncate',
            title: name
          }, name),
          // Email with better hover state
          h('div', { 
            class: 'text-xs text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200 truncate',
            onClick: () => window.open(`mailto:${email}`, '_blank'),
            title: email
          }, email)
        ])
      ])
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.name || ''
      const nameB = rowB.original.name || ''
      return nameA.localeCompare(nameB)
    },
  },
  {
    id: 'contact_info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Contact Info' }),
    cell: ({ row }) => {
      const supplier = row.original
      const phone = supplier.phone || '-'
      const address = supplier.address || '-'
      const formattedPhone = formatPhoneNumber(phone)
      
      return h('div', { class: 'space-y-2 max-w-[200px]' }, [
        // Phone with better styling
        h('div', { 
          class: 'text-sm font-mono text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200 flex items-center gap-1',
          onClick: () => window.open(`tel:${phone}`, '_blank'),
          title: `Call ${phone}`
        }, [
          h('span', { class: 'text-gray-400' }, '📞'),
          formattedPhone
        ]),
        // Address with better truncation
        h('div', { 
          class: 'text-xs text-gray-500 line-clamp-2 leading-relaxed',
          title: address
        }, address),
      ])
    },
  },
  {
    id: 'bank_info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Bank Info' }),
    cell: ({ row }) => {
      const supplier = row.original
      const bankAccounts = supplier.bankAccounts || []
      const primaryBank = bankAccounts.find(bank => bank.isPrimary)
      
      if (!primaryBank) {
        return h('div', { class: 'text-center py-2' }, [
          h(Badge, { variant: 'outline', class: 'text-xs text-gray-400' }, 'No Bank Info')
        ])
      }
      
      return h('div', { class: 'space-y-1.5' }, [
        // Bank name with icon
        h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'text-gray-400 text-xs' }, '🏦'),
          h('span', { class: 'text-xs font-semibold text-gray-700' }, primaryBank.bankName || '-')
        ]),
        // Account number
        h('div', { class: 'text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded' }, 
          primaryBank.accountNumber ? `****${primaryBank.accountNumber.slice(-4)}` : '-'
        ),
        // Account holder name
        h('div', { class: 'text-xs text-gray-500 truncate max-w-[140px]' }, 
          primaryBank.accountName || '-'
        )
      ])
    },
    enableSorting: false,
  },
  {
    id: 'tax_info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Tax Info (NPWP)' }),
    cell: ({ row }) => {
      const supplier = row.original
      const taxIdentifications = supplier.taxIdentifications || []
      const npwp = taxIdentifications.find(tax => tax.taxType === 'npwp')
      
      if (!npwp) {
        return h('div', { class: 'text-center py-2' }, [
          h(Badge, { variant: 'outline', class: 'text-xs text-gray-400' }, 'No NPWP')
        ])
      }
      
      return h('div', { class: 'space-y-1.5' }, [
        // NPWP status and number
        h(Badge, { 
          variant: npwp.isActive ? 'default' : 'secondary',
          class: `text-xs font-mono ${npwp.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600'}`
        }, npwp.taxNumber || '-'),
        // Tax holder name
        h('div', { class: 'text-xs text-gray-500 truncate max-w-[120px]' }, 
          npwp.taxName || '-'
        ),
        // Active status indicator
        npwp.isActive && h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'w-2 h-2 bg-green-500 rounded-full' }),
          h('span', { class: 'text-xs text-green-600 font-medium' }, 'Active')
        ])
      ])
    },
    enableSorting: false,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Created Date' }),
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at')
      if (!createdAt) return h('span', { class: 'text-gray-400' }, '-')
      
      const date = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let relativeTime = ''
      let timeClass = 'text-gray-500'
      
      if (diffDays === 0) {
        relativeTime = 'Today'
        timeClass = 'text-green-600'
      } else if (diffDays === 1) {
        relativeTime = 'Yesterday'
        timeClass = 'text-blue-600'
      } else if (diffDays <= 7) {
        relativeTime = `${diffDays} days ago`
        timeClass = 'text-blue-600'
      } else if (diffDays <= 30) {
        relativeTime = `${Math.ceil(diffDays / 7)} weeks ago`
      } else {
        relativeTime = `${Math.ceil(diffDays / 30)} months ago`
      }
      
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'text-sm font-medium text-gray-900' }, 
          date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        ),
        h('div', { class: `text-xs ${timeClass} font-medium` }, relativeTime)
      ])
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.created_at || 0)
      const dateB = new Date(rowB.original.created_at || 0)
      return dateB.getTime() - dateA.getTime() // Most recent first
    },
  },
  {
    id: 'actions',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Actions' }),
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
  },
]