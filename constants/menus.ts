// menus.ts
import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'Customer Dashboard',
    roles: ['customer'], // ⬅ Roles untuk heading
    items: [
      {
        title: 'Profil Perusahaan',
        icon: 'i-lucide-building',
        link: '/account',
        roles: ['customer'],
      },
      {
        title: 'Product',
        icon: 'i-lucide-box',
        link: '/product',
        roles: ['customer'],
      },
      {
        title: 'Pesanan Saya',
        icon: 'i-lucide-package',
        link: '/orders',
        roles: ['customer'],
      },
    ],
  },
  {
    heading: 'Supplier Dashboard',
    roles: ['supplier'],
    items: [
      // {
      //   title: 'Katalog Product',
      //   icon: 'i-lucide-box',
      //   link: '/product/catalog',
      //   roles: ['supplier'],
      // },
      {
        title: 'Profil Perusahaan',
        icon: 'i-lucide-building',
        link: '/account',
        roles: ['supplier'],
      },
      {
        title: 'Pesanan Masuk',
        icon: 'i-lucide-package-check',
        link: '/orders/incoming',
        roles: ['supplier'],
      },
      {
        title: 'Pesanan Saya',
        icon: 'i-lucide-package-check',
        link: '/orders/me',
        roles: ['supplier'],
      },
      {
        title: 'Produk Saya',
        icon: 'i-lucide-box',
        link: '/product/my',
        roles: ['supplier'],
      },
      // {
      //   title: 'Status Pemasangan',
      //   icon: 'i-lucide-trending-up',
      //   link: '/supplier/installation-status',
      //   roles: ['supplier'],
      // },
      // {
      //   title: 'Laporan Evaluasi',
      //   icon: 'i-lucide-file-text',
      //   link: '/supplier/evaluation-reports',
      //   roles: ['supplier'],
      // },
    ],
  },
  {
    heading: 'General',
    roles: ['admin'], // ⬅ Roles untuk heading
    items: [
      {
        title: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        link: '/',
        roles: ['admin', 'supplier', 'customer'],
      },
    ],
  },
  {
    heading: 'Business',
    roles: ['admin', 'supplier'], // ⬅ Roles untuk heading
    items: [
      {
        title: 'Sales Orders',
        icon: 'i-lucide-package',
        link: '/orders',
        roles: ['admin'],
      },
      {
        title: 'Installation',
        icon: 'i-lucide-shopping-cart',
        link: '/purchase-orders',
        roles: ['admin', 'customer'],
      },
    ],
  },
  {
    heading: 'Product',
    roles: ['admin', 'supplier'],
    items: [
      {
        title: 'Bundling',
        icon: 'i-lucide-package-plus', // ikon bundling / paket produk
        link: '/product/bundling',
        roles: ['admin'],
      },
      {
        title: 'Item',
        icon: 'i-lucide-box', // ikon item/produk individual
        link: '/product/item',
        roles: ['admin'],
      },
    ],
  },
  {
    heading: 'Master',
    roles: ['admin', 'supplier'], // ⬅ Roles untuk heading
    items: [
      {
        title: 'Customers',
        icon: 'i-lucide-users',
        link: '/customers',
        roles: ['admin'],
      },
      {
        title: 'Suppliers',
        icon: 'i-lucide-truck',
        link: '/suppliers',
        roles: ['admin'],
      },
    ],
  },
  {
    heading: 'Reports',
    roles: ['admin', 'supplier'], // ⬅ Roles untuk heading
    items: [
      {
        title: 'Sales Report',
        icon: 'i-lucide-trending-up',
        link: '/reports/sales',
        roles: ['admin', 'supplier'],
      },
      {
        title: 'Customer Report',
        icon: 'i-lucide-users-2',
        link: '/reports/customers',
        roles: ['admin'],
      },
      {
        title: 'Inventory Report',
        icon: 'i-lucide-bar-chart-3',
        link: '/reports/inventory',
        roles: ['admin', 'supplier'],
      },
      {
        title: 'Order History',
        icon: 'i-lucide-history',
        link: '/reports/orders',
        roles: ['customer'],
      },
    ],
  },
  {
    heading: 'Management',
    roles: ['admin'], // ⬅ Roles untuk heading
    items: [
      {
        title: 'User Management',
        icon: 'i-lucide-users-cog',
        link: '/management/users',
        roles: ['admin'],
      },
      {
        title: 'System Settings',
        icon: 'i-lucide-settings',
        link: '/management/settings',
        roles: ['admin'],
      },
    ],
  },
]

export const navMenuBottom: NavMenuItems = [
  {
    title: 'Bantuan & Tiket',
    icon: 'i-lucide-life-buoy',
    link: '/help',
    roles: ['admin', 'supplier', 'customer'],
  },
  {
    title: 'Panduan & Dokumen',
    icon: 'i-lucide-book-open',
    link: '/docs',
    roles: ['admin', 'supplier', 'customer'],
  },
  {
    title: 'Keamanan & Login',
    icon: 'i-lucide-lock',
    link: '/account/security',
    roles: ['customer'],
  },
]

// Helper function to filter menu items by role
export function filterMenuByRole(menu: NavMenu[], userRole: string): NavMenu[] {
  return menu
    .filter(section => {
      // ⬅ Filter heading berdasarkan roles
      if (section.roles && section.roles.length > 0) {
        return section.roles.includes(userRole)
      }
      return true
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if ('roles' in item && item.roles) {
          return item.roles.includes(userRole)
        }
        return true
      }),
    }))
    .filter(section => section.items.length > 0) // Filter section yang tidak memiliki items
}

// Helper function to filter bottom menu by role
export function filterBottomMenuByRole(menu: NavMenuItems, userRole: string): NavMenuItems {
  return menu.filter(item => {
    if ('roles' in item && item.roles) {
      return item.roles.includes(userRole)
    }
    return true
  })
}