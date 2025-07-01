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
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Nama Mitra Bisnis' }),
    cell: ({ row }) => {
      const supplier = row.original
      const name = supplier.name || '-'
      const supplierCode = supplier.supplier_code || '-'
      const email = supplier.email || '-'
      const initials = getInitials(name)
      const avatarColor = getAvatarColor(name)

      return h('div', { class: 'flex items-center gap-3 max-w-[250px]' }, [
        // Avatar with random image and initials fallback
        /*h(Avatar, { class: 'h-9 w-9 flex-shrink-0' }, [
          h(AvatarImage, {
            src: getRandomAvatar(name, supplier.id),
            alt: name
          }),
          h(AvatarFallback, {
            class: `${avatarColor} text-white text-xs font-semibold`
          }, initials)
        ]), */
        h('div', { class: 'space-y-1 min-w-0 flex-1' }, [
                  // Supplier Name
                  h('div', {
            class: 'font-semibold text-sm text-gray-900 truncate',
            title: name
          }, name),
          // Supplier Code with enhanced styling
          h('div', { class: 'flex items-center gap-2' }, [
            h(Badge, {
              variant: 'secondary',
              class: 'text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5'
            }, supplierCode),
          ]),

          // Email with better hover state

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
    id: 'kategori',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Kategori' }),
    cell: ({ row }) => {
            const supplier = row.original
            const ktg = supplier.kategori || '-'
            
            return h('div', { class: 'space-y-2 max-w-[200px]' }, [
              h('div', { class: 'space-y-1 min-w-0 flex-1' }, [
      h('div', { class: 'flex items-center gap-2' }, [
        h(Badge, {
          variant: 'secondary',
          class: 'text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5'
        }, ktg)
      ])
              ])
            ])

                    
    }
  },
  {
    id: 'tax_info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'NPWP' }),
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
      ])
    },
    enableSorting: false,
  },

  {
      id: 'Email Pajak',
      header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Email Fraktur Pajak' }),
      cell: ({ row }) => {
      const supplier = row.original
      const emailx = supplier.email || '-'
      
      return h('div', { class: 'space-y-1.5' }, [
        h('div', {
          class: 'text-xs text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200 truncate',
          onClick: () => window.open(`mailto:${email}`, '_blank'),
          title: emailx
        }, emailx)
      ])
      }
  },
  
  {
    id: 'conectApiA',
        header: ({ column }) => h(DataTableColumnHeader, { column, title: 'API Accurate' }),
        cell: ({ row }) => {
        const supplier = row.original
        const accurateID = supplier.accurate_id || '-'
        const astat = supplier.astat || '-'
        const accurateSecret = supplier.accurate_sc || '-'
    if(astat){var astat_data = 'Aktif'}else{ var astat_data = 'Suspend'}
        

        return h('div', { class: 'space-y-1.5' }, [
        // Accurate
        h('div', { class: 'flex items-center gap-1' }, [
                  h('span', { class: 'text-blue-700 text-xs font-semibold' }, [
            h('img', {
              src:'/response.png',
              alt:'API',
              style: { width: '20px' }
            })
          ]),
          h('span', { class: 'text-xs font-semibold text-red-700' }, 'Accurate'),
                  h('span', { class: 'text-xs font-semibold' }, 'Status:'),
                  h('span', { class: `text-xs font-mono ${astat ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600'}`}, astat_data)

        ]),
                
        // accurate ID
                 h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'text-blue-700 text-xs font-semibold' }, 'ID'),
          h('span', { class: 'text-xs text-green-500 font-mono bg-gray-50 px-2 py-1 rounded' },accurateID)
        ]),
                // accurate secret
                 h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'text-blue-700 text-xs font-semibold' }, 'Secret'),
          h('span', { class: 'text-xs text-green-500 font-mono bg-gray-50 px-2 py-1 rounded' },accurateSecret)
        ])
                
      ])
        }
  },

    {
        id: 'conectApiX',
        header: ({ column }) => h(DataTableColumnHeader, { column, title: 'API Xendit' }),
        cell: ({ row }) => {
        const supplier = row.original
        const xenditID = supplier.xendit_id || '-'
        const xenditSecret = supplier.xendit_sc || '-'
    const xstat = supplier.xstat || '-'
    if(xstat){var xstat_data = 'Aktif'}else{ var xstat_data = 'Suspend'}


        return h('div', { class: 'space-y-1.5' }, [
        // Xendit
         h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'text-blue-700 text-xs font-semibold' }, [
            h('img', {
              src:'/response.png',
              alt:'API',
              style: { width: '20px' }

            })
          ]),
          h('span', { class: 'text-xs font-semibold text-blue-700' }, 'Xendit'),
                  h('span', { class: 'text-xs font-semibold' }, 'Status:'),
                  h('span', { class: `text-xs font-mono ${xstat ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600'}`}, xstat_data)
        ]),
                // Xendit ID
                 h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'text-blue-700 text-xs font-semibold' }, 'ID'),
          h('span', { class: 'text-xs text-green-500 font-mono bg-gray-50 px-2 py-1 rounded' },xenditID)
        ]),
                // Xendit secret
                 h('div', { class: 'flex items-center gap-1' }, [
          h('span', { class: 'text-blue-700 text-xs font-semibold' }, 'Secret'),
          h('span', { class: 'text-xs text-green-500 font-mono bg-gray-50 px-2 py-1 rounded' },xenditSecret)
        ])
      ])
        }
  },
  {
    id: 'actions',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Aksi' }),
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
  },
]