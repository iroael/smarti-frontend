// columns.ts
import type { Product } from '../data/schema'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const columns = (onDeleteSuccess: () => void): ColumnDef<Product>[] => [
  {
    id: 'product_info',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Product Information' }),
    cell: ({ row }) => {
      const product = row.original
      const productCode = product.product_code || '-'
      const name = product.name || '-'
      const description = product.description || '-'
      const inventoryTypeRaw = product.inventory_type || '-'
      const inventoryType = inventoryTypeRaw.charAt(0).toUpperCase() + inventoryTypeRaw.slice(1).toLowerCase()

      return h('div', { class: 'space-y-1 max-w-[400px]' }, [
        // Product Code + Inventory Type
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', {
            class: 'text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600',
          }, productCode),
          h('span', {
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
          }, inventoryType)
        ]),

        // Product Name
        h('div', { class: 'font-medium text-sm' }, name),
        // Description
        h('div', { class: 'text-xs text-gray-500 truncate' }, description),
      ])
    },
    // Enable sorting by product name
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.name || ''
      const nameB = rowB.original.name || ''
      return nameA.localeCompare(nameB)
    },
  },
  {
    id: 'supplier',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Supplier' }),
    cell: ({ row }) => {
      const product = row.original
      console.log('supplier = ',product.supplier)
      const supplierCode = product.supplier?.supplier_code || '-'
      const supplierName = product.supplier?.name || '-'
      
      return h('div', { class: 'space-y-1' }, [
        // Supplier Code
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'text-xs font-mono bg-blue-100 px-2 py-1 rounded text-blue-600' }, supplierCode),
        ]),
        // Supplier Name
        h('div', { class: 'text-sm font-medium' }, supplierName),
      ])
    },
  },
  {
    id: 'dpp_beli',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'DPP Beli Vendor' }),
    cell: ({ row }) => {
      const product = row.original
      const price = parseFloat(product.prices?.[0]?.dpp_beli || '0').toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
      })
      return h('span', price)
    },
    // Enable sorting by DPP beli
    sortingFn: (rowA, rowB) => {
      const priceA = parseFloat(rowA.original.prices?.[0]?.dpp_beli || '0')
      const priceB = parseFloat(rowB.original.prices?.[0]?.dpp_beli || '0')
      return priceA - priceB
    },
  },
  {
    id: 'dpp_jual',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'DPP Jual KSS' }),
    cell: ({ row }) => {
      const product = row.original
      const price = parseFloat(product.prices?.[0]?.dpp_jual || '0').toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
      })
      return h('span', price)
    },
    // Enable sorting by DPP jual
    sortingFn: (rowA, rowB) => {
      const priceA = parseFloat(rowA.original.prices?.[0]?.dpp_jual || '0')
      const priceB = parseFloat(rowB.original.prices?.[0]?.dpp_jual || '0')
      return priceA - priceB
    },
  },
  {
    id: 'harga_jual',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Harga Jual PLN' }),
    cell: ({ row }) => {
      const product = row.original
      const price = parseFloat(product.prices?.[0]?.h_jual_b || '0').toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
      })
      return h('span', price)
    },
    // Enable sorting by harga jual
    sortingFn: (rowA, rowB) => {
      const priceA = parseFloat(rowA.original.prices?.[0]?.h_jual_b || '0')
      const priceB = parseFloat(rowB.original.prices?.[0]?.h_jual_b || '0')
      return priceA - priceB
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Stock' }),
    cell: ({ row }) => h('span', {}, row.getValue('stock')),
  },
  {
    accessorKey: 'is_bundle',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Bundle?' }),
    cell: ({ row }) => {
      const isBundle = row.getValue('is_bundle')
      return h(Badge, {
        variant: isBundle ? 'default' : 'outline',
      }, () => isBundle ? 'Yes' : 'No')
    },
  },
  {
    id: 'actions',
    header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Action' }),
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        onDeleteSuccess,
      }),
  },
]