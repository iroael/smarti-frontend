// columns/partyColumn.ts
import { h } from 'vue'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Order } from '../data/schema'
import { generateAvatar } from '@/utils/avatar'

export function getPartyColumn(partyType: 'customer' | 'supplier'): ColumnDef<Order> {
  return {
    id: partyType,
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column,
        title: partyType === 'customer' ? 'Customer' : 'Supplier'
      }),
    cell: ({ row }) => {
      const party = row.original[partyType]
      if (!party) return h('div', {}, '-')

      const { initials, color, avatarUrl } = generateAvatar(party.name, party.avatar)

      return h('div', { class: 'flex items-center gap-3' }, [
        avatarUrl
          ? h(Avatar, { class: 'h-8 w-8' }, [
              h(AvatarImage, { src: avatarUrl })
            ])
          : h('div', {
              class: 'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white',
              style: { backgroundColor: color }
            }, initials),
        h('div', { class: 'flex flex-col min-w-0' }, [
          h('div', { class: 'font-medium truncate' }, party.name),
          h('div', { class: 'text-xs text-muted-foreground truncate' }, party.phone || '-'),
          party.npwp && h('div', { class: 'text-xs text-muted-foreground truncate' }, `NPWP: ${party.npwp}`)
        ])
      ])
    },
  }
}
