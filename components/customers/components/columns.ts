import type { ColumnDef } from '@tanstack/vue-table'
import type { Customer } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { h } from 'vue'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  XCircle,
  Crown
} from 'lucide-vue-next'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

// === Util ===

const getInitials = (name: string): string =>
  name?.split(' ').map((word) => word.charAt(0)).join('').toUpperCase().slice(0, 2)

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : phone
}

const truncateText = (text: string, maxLength = 30): string =>
  text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text

// === Enhanced Avatar Colors with UnoCSS ===

const avatarColorSchemes = [
  // Vibrant colors
  { bg: 'bg-red-500', text: 'text-white', border: 'border-red-200' },
  { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-200' },
  { bg: 'bg-green-500', text: 'text-white', border: 'border-green-200' },
  { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-200' },
  { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-200' },
  { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-200' },
  { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-200' },
  { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-200' },
  { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-200' },
  { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-200' },
  
  // Gradient backgrounds (UnoCSS)
  { bg: 'bg-gradient-to-br from-pink-500 to-rose-500', text: 'text-white', border: 'border-pink-200' },
  { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-white', border: 'border-blue-200' },
  { bg: 'bg-gradient-to-br from-purple-500 to-indigo-500', text: 'text-white', border: 'border-purple-200' },
  { bg: 'bg-gradient-to-br from-green-500 to-teal-500', text: 'text-white', border: 'border-green-200' },
  { bg: 'bg-gradient-to-br from-orange-500 to-red-500', text: 'text-white', border: 'border-orange-200' },
  
  // Softer tones
  { bg: 'bg-slate-600', text: 'text-white', border: 'border-slate-200' },
  { bg: 'bg-zinc-600', text: 'text-white', border: 'border-zinc-200' },
  { bg: 'bg-stone-600', text: 'text-white', border: 'border-stone-200' },
]

// Method 1: Hash-based consistent color (recommended)
const getConsistentColorFromName = (name: string): typeof avatarColorSchemes[0] => {
  if (!name) return avatarColorSchemes[0]
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % avatarColorSchemes.length
  return avatarColorSchemes[index]
}

// Method 2: ID-based color (if you have customer IDs)
const getColorFromId = (id: string | number): typeof avatarColorSchemes[0] => {
  const numericId = typeof id === 'string' ? parseInt(id) || 0 : id
  const index = numericId % avatarColorSchemes.length
  return avatarColorSchemes[index]
}

// Method 3: First letter based color
const getColorFromInitial = (name: string): typeof avatarColorSchemes[0] => {
  if (!name) return avatarColorSchemes[0]
  const firstLetter = name.charAt(0).toLowerCase()
  const charCode = firstLetter.charCodeAt(0)
  const index = (charCode - 97) % avatarColorSchemes.length // 'a' = 97
  return avatarColorSchemes[Math.max(0, index)]
}

// === Columns ===

export const columns = (onDeleteSuccess: () => void): ColumnDef<Customer>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Customer' }),
    cell: ({ row }) => {
      const { name, email, id } = row.original
      const initials = getInitials(name)
      
      // Choose your preferred method:
      // Option 1: Consistent based on name (recommended)
      const colorScheme = getConsistentColorFromName(name)
      
      // Option 2: Based on customer ID (if available)
      // const colorScheme = getColorFromId(id)
      
      // Option 3: Based on first letter
      // const colorScheme = getColorFromInitial(name)

      return h('div', { class: 'flex items-center space-x-3' }, [
        h(Avatar, { 
          class: `h-10 w-10 border-2 ${colorScheme.border} shadow-sm hover:shadow-md transition-shadow duration-200` 
        }, [
          h(AvatarFallback, {
            class: `${colorScheme.bg} ${colorScheme.text} font-bold text-sm hover:scale-105 transition-transform duration-200`
          }, initials)
        ]),
        h('div', {}, [
          h('div', { class: 'font-medium text-foreground' }, name),
          h('div', { class: 'text-xs text-muted-foreground flex items-center gap-1' }, [
            h(Mail, { class: 'h-3 w-3' }),
            email,
          ]),
        ]),
      ])
    },
    size: 250,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Contact' }),
    cell: ({ row }) => {
      const { phone, address } = row.original
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'flex items-center gap-2 text-sm' }, [
          h(Phone, { class: 'h-4 w-4 text-green-600' }),
          h('span', { class: 'font-mono' }, formatPhoneNumber(phone))
        ]),
        h(TooltipProvider, {}, [
          h(Tooltip, {}, [
            h(TooltipTrigger, { asChild: true }, [
              h('div', { class: 'flex items-center gap-2 text-sm text-muted-foreground cursor-help' }, [
                h(MapPin, { class: 'h-4 w-4 text-blue-600' }),
                h('span', {}, truncateText(address, 25))
              ])
            ]),
            h(TooltipContent, { class: 'max-w-xs' }, [
              h('p', {}, address)
            ])
          ])
        ])
      ])
    },
    size: 200,
  },
  {
    accessorKey: 'tax',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Tax Info' }),
    cell: ({ row }) => {
      const taxes = row.original.tax ?? []
      const primaryTax = Array.isArray(taxes) ? taxes.find(t => t.isPrimary) || taxes[0] : taxes

      if (!primaryTax) {
        return h('div', { class: 'flex items-center gap-2 text-muted-foreground' }, [
          h(XCircle, { class: 'h-4 w-4 text-red-500' }),
          h('span', {}, 'No tax info')
        ])
      }

      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          h(Building2, { class: 'h-4 w-4 text-purple-600' }),
          h(Badge, { variant: 'outline', class: 'text-xs font-mono bg-purple-50 text-purple-700 border-purple-200' },
            primaryTax.taxType?.toUpperCase() || '-'
          ),
        ]),
        h('div', { class: 'flex items-center gap-2 text-sm' }, [
          h(CreditCard, { class: 'h-4 w-4 text-blue-600' }),
          h('span', { class: 'font-mono' }, primaryTax.taxNumber)
        ]),
      ])
    },
    size: 220,
  },
  {
    accessorKey: 'bank',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Bank Account' }),
    cell: ({ row }) => {
      const banks = row.original.bank ?? []
      const primaryBank = Array.isArray(banks) ? banks.find(b => b.isPrimary) || banks[0] : banks

      if (!primaryBank) {
        return h('div', { class: 'flex items-center gap-2 text-muted-foreground' }, [
          h(XCircle, { class: 'h-4 w-4' }),
          h('span', {}, 'No bank account')
        ])
      }

      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'flex items-center gap-2 text-sm' }, [
          h(Building2, { class: 'h-4 w-4 text-green-600' }),
          h('span', { class: 'font-semibold' }, primaryBank.bankName),
          primaryBank.isPrimary && h(Crown, { class: 'h-3 w-3 text-yellow-500' })
        ]),
        h('div', { class: 'text-sm text-muted-foreground' }, [
          h('div', { class: 'font-mono' }, `****${primaryBank.accountNumber.slice(-4)}`),
          h('div', {}, primaryBank.accountName)
        ]),
        Array.isArray(banks) && banks.length > 1 && h(Badge, { variant: 'secondary', class: 'text-xs' }, `+${banks.length - 1} more`)
      ])
    },
    size: 220,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Joined' }),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string
      const date = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      let relative = ''

      if (diffDays === 1) relative = 'Yesterday'
      else if (diffDays < 7) relative = `${diffDays} days ago`
      else if (diffDays < 30) relative = `${Math.floor(diffDays / 7)} weeks ago`
      else if (diffDays < 365) relative = `${Math.floor(diffDays / 30)} months ago`
      else relative = `${Math.floor(diffDays / 365)} years ago`

      return h('div', { class: 'flex items-center gap-2' }, [
        h(Calendar, { class: 'h-4 w-4 text-indigo-600' }),
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'text-sm font-medium' }, date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })),
          h('span', { class: 'text-xs text-muted-foreground' }, relative)
        ])
      ])
    },
    size: 140,
  },
  {
    id: 'actions',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Action' }),
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
    size: 50,
  },
]