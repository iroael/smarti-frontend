// columns.ts
import type { Product } from '../data/schema'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

interface ColumnOptions {
  role?: string
  viewType?: 'price' | 'item' | 'bundling'
}

export const columns = (
  onDeleteSuccess: () => void,
  options?: ColumnOptions
): ColumnDef<Product>[] => {
  const baseColumns: ColumnDef<Product>[] = [
    {
      id: 'product_info',
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: 'Product Information' }),
      cell: ({ row }) => {
        const product = row.original
        const productCode = product.product_code || '-'
        const name = product.name || '-'
        const description = product.description || '-'
        const inventoryTypeRaw = product.inventory_type || '-'
        const inventoryType =
          inventoryTypeRaw.charAt(0).toUpperCase() +
          inventoryTypeRaw.slice(1).toLowerCase()

        return h('div', { class: 'space-y-1 max-w-[400px]' }, [
          h('div', { class: 'flex items-center gap-2' }, [
            h(
              'span',
              {
                class:
                  'text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600',
              },
              productCode
            ),
            h(
              'span',
              {
                class: [
                  'text-xs font-mono px-2 py-1 rounded',
                  product.inventory_type === 'finished goods'
                    ? 'bg-green-100 text-green-600'
                    : product.inventory_type === 'raw material'
                    ? 'bg-yellow-100 text-yellow-600'
                    : product.inventory_type === 'stock'
                    ? 'bg-blue-100 text-blue-600'
                    : product.inventory_type === 'service'
                    ? 'bg-purple-100 text-purple-600'
                    : product.inventory_type === 'digital'
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-gray-100 text-gray-600',
                ].join(' '),
              },
              inventoryType
            ),
          ]),
          h('div', { class: 'font-medium text-sm' }, name),
          h('div', { class: 'text-xs text-gray-500 truncate' }, description),
        ])
      },
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original.name || ''
        const nameB = rowB.original.name || ''
        return nameA.localeCompare(nameB)
      },
    },

    // {
    //   id: 'dimension',
    //   header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Dimensi (cm)' }),
    //   cell: ({ row }) => {
    //     const inventory_type = row.original
    //     if (inventory_type === 'service') {
    //       return h('span', '-')
    //     }
    //     const length = row.original.length || 0
    //     const width = row.original.width || 0
    //     const height = row.original.height || 0

    //     console.log(row.original.id, row.original.product_code, `${length} x ${width} x ${height}`)

    //     // Jika semuanya 0, kemungkinan belum diisi
    //     const isEmpty = !length && !width && !height
    //     return h('span', isEmpty ? '-' : `${length} x ${width} x ${height}`)
    //   },
    // },

    {
      id: 'weight',
      header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Berat (gram)' }),
      cell: ({ row }) => {
        const { weight, inventory_type } = row.original
        if (inventory_type === 'service') {
          return h('span', '-')
        }
        return h('span', `${(weight || 0).toLocaleString('id-ID')} gr`)
      },
    },
  ]

  if (options?.viewType === 'price') {
    baseColumns.push(
      {
        id: 'dpp_beli',
        header: ({ column }) =>
          h(DataTableColumnHeader, { column, title: 'DPP Beli Vendor' }),
        cell: ({ row }) => {
          const price = parseFloat(row.original.prices?.[0]?.dpp_beli || '0').toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          })
          return h('span', price)
        },
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.prices?.[0]?.dpp_beli || '0')
          const b = parseFloat(rowB.original.prices?.[0]?.dpp_beli || '0')
          return a - b
        },
      },
      {
        id: 'dpp_jual',
        header: ({ column }) =>
          h(DataTableColumnHeader, { column, title: 'DPP Jual KSS' }),
        cell: ({ row }) => {
          const price = parseFloat(row.original.prices?.[0]?.dpp_jual || '0').toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          })
          return h('span', price)
        },
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.prices?.[0]?.dpp_jual || '0')
          const b = parseFloat(rowB.original.prices?.[0]?.dpp_jual || '0')
          return a - b
        },
      },
      {
        id: 'harga_jual',
        header: ({ column }) =>
          h(DataTableColumnHeader, { column, title: 'Harga Jual PLN' }),
        cell: ({ row }) => {
          const price = parseFloat(row.original.prices?.[0]?.h_jual_b || '0').toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          })
          return h('span', price)
        },
        sortingFn: (rowA, rowB) => {
          const a = parseFloat(rowA.original.prices?.[0]?.h_jual_b || '0')
          const b = parseFloat(rowB.original.prices?.[0]?.h_jual_b || '0')
          return a - b
        },
      },
    )
  }

  if (options?.viewType !== 'bundling') {
    baseColumns.push({
      accessorKey: 'stock',
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: 'Stock' }),
      cell: ({ row }) => {
        const { stock, inventory_type } = row.original
        return h('span', inventory_type === 'service' ? '-' : stock)
      },
    })
  }

  baseColumns.push({
    accessorKey: 'is_bundle',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Bundle?' }),
    cell: ({ row }) => {
      const isBundle = row.getValue('is_bundle')
      return h(Badge, {
        variant: isBundle ? 'default' : 'outline',
      }, () => isBundle ? 'Yes' : 'No')
    },
  })

  baseColumns.push({
    id: 'actions',
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: 'Action' }),
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
  })

  return baseColumns
}
