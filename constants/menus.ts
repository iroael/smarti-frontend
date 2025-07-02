// menus.ts
import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  // CUSTOMER DASHBOARD MENU
  {
    heading: 'Customer Dashboard',
    roles: ['customer'],
    items: [
      {
        title: 'Profil Perusahaan',
        icon: 'i-lucide-building',
        link: '/account',
        roles: ['customer'],
      },
      {
        title: 'Proyek Perumahan',
        icon: 'i-lucide-home',
        link: '/projects',
        roles: ['customer'],
      },
    ],
  },
  {
    heading: 'Pemesanan',
    roles: ['customer'],
    items: [
      {
        title: 'Buat Pesanan Baru',
        icon: 'i-lucide-shopping-cart',
        link: '/orders/new-create',
        roles: ['customer'],
      },
      {
        title: 'Daftar Pesanan',
        icon: 'i-lucide-list-ordered',
        link: '/orders',
        roles: ['customer'],
      },
      {
        title: 'Lacak Pengiriman',
        icon: 'i-lucide-truck',
        link: '/delivery',
        roles: ['customer'],
      },
    ],
  },
  {
    heading: 'Keuangan',
    roles: ['customer'],
    items: [
      {
        title: 'Faktur & Tagihan',
        icon: 'i-lucide-file-text',
        link: '/invoices',
        roles: ['customer'],
      },
    ],
  },
  {
    heading: 'Smarti Solutions',
    roles: ['customer'],
    items: [
      {
        title: 'Pasang Smarti',
        icon: 'i-lucide-cpu',
        link: '/smarti/install',
        roles: ['customer'],
      },
      {
        title: 'Layanan Smarti',
        icon: 'i-lucide-settings',
        link: '/smarti/services',
        roles: ['customer'],
      },
    ],
  },

  // SUPPLIER
  {
    heading: 'Supplier Dashboard',
    roles: ['supplier'],
    items: [
      {
        title: 'Profil Perusahaan',
        icon: 'i-lucide-building',
        link: '/account',
        roles: ['supplier'],
      },
      {
        title: 'Buat Pesanan',
        icon: 'i-lucide-package',
        link: '/orders/new-create',
        roles: ['customer'],
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
    ],
  },

  // GENERAL
  {
    heading: 'General',
    roles: ['admin'],
    items: [
      {
        title: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        link: '/',
        roles: ['admin', 'supplier', 'customer'],
      },
    ],
  },

  // BUSINESS
  // {
  //   heading: 'Business',
  //   roles: ['admin', 'supplier'],
  //   items: [
  //     {
  //       title: 'Sales Orders',
  //       icon: 'i-lucide-package',
  //       link: '/orders',
  //       roles: ['admin'],
  //     },
  //     {
  //       title: 'Installation',
  //       icon: 'i-lucide-shopping-cart',
  //       link: '/purchase-orders',
  //       roles: ['admin', 'customer'],
  //     },
  //   ],
  // },

  // PRODUCT
  {
    heading: 'Master',
    roles: ['admin', 'supplier'],
    items: [
      {
        title: 'Produk',
        icon: 'i-lucide-package',
        roles: ['admin'],
        children: [
          {
            title: 'Bundling',
            icon: 'i-lucide-package-plus',
            link: '/product/bundling',
            roles: ['admin'],
          },
          {
            title: 'Item',
            icon: 'i-lucide-box',
            link: '/product/item',
            roles: ['admin'],
          },
          {
            title: 'Master Harga',
            icon: 'i-lucide-percent',
            link: '/product/price',
            roles: ['admin'],
          },
          {
            title: 'Tax',
            icon: 'i-lucide-percent',
            link: '/tax',
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'SSO Sireng & Vendor',
        icon: 'i-lucide-users',
        roles: ['admin'],
        children: [
          {
            title: 'SSO Sireng',
            icon: 'i-lucide-users',
            link: '/customers',
            roles: ['admin'],
          },
          {
            title: 'Vendor',
            icon: 'i-lucide-truck',
            link: '/suppliers',
            roles: ['admin'],
          },
        ],
      },
    ],
  },

  // PURCHASING
  {
    heading: 'Transaksi',
    roles: ['admin'],
    items: [
      {
        title: 'Pembelian',
        icon: 'i-lucide-shopping-bag', // Ganti dari lock ke shopping bag
        roles: ['admin'],
        children: [
          {
            title: 'Pesanan Pembelian',
            icon: 'i-lucide-file-plus', // Tetap, sudah sesuai
            link: '/purchase-orders',
            roles: ['admin'],
          },
          {
            title: 'Penerimaan Barang',
            icon: 'i-lucide-package-check', // Ganti ke package-check agar lebih jelas
            link: '/goods-receipt',
            roles: ['admin'],
          },
          {
            title: 'Transaksi Pembelian',
            icon: 'i-lucide-receipt', // Lebih menggambarkan transaksi
            link: '/purchase-transactions',
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'Penjualan',
        icon: 'i-lucide-hand-coins', // Ganti dari lock ke hand-coins agar relevan dengan penjualan
        roles: ['admin'],
        children: [
          {
            title: 'Pesanan Jual',
            icon: 'i-lucide-shopping-cart', // Tetap, sudah sesuai
            link: '/orders',
            roles: ['admin'],
          },
          {
            title: 'Pengiriman',
            icon: 'i-lucide-truck', // Ganti dari send ke truck untuk konsistensi dengan logistik
            link: '/delivery',
            roles: ['admin'],
          },
          {
            title: 'Transaksi Penjualan',
            icon: 'i-lucide-receipt', // Sama seperti pembelian, untuk menggambarkan transaksi
            link: '/sales-transactions',
            roles: ['admin'],
          },
        ],
      },
    ],
  },

  // SYNC
  {
    heading: 'Sinkronisasi',
    roles: ['admin'],
    items: [
      {
        title: 'Update Harga',
        icon: 'i-lucide-refresh-ccw',
        link: '/price-update',
        roles: ['admin'],
      },
    ],
  },

  // RECONCILIATION
  {
    heading: 'Rekonsiliasi Data',
    roles: ['admin'],
    items: [
      {
        title: 'Accutare',
        icon: 'i-lucide-database',
        link: '/reconcile/accutare',
        roles: ['admin'],
      },
      {
        title: 'Payment Gateway',
        icon: 'i-lucide-credit-card',
        link: '/reconcile/payment',
        roles: ['admin'],
      },
      {
        title: 'Bank',
        icon: 'i-lucide-banknote',
        link: '/reconcile/bank',
        roles: ['admin'],
      },
    ],
  },

  // REPORTS
  {
    heading: 'Reports',
    roles: ['admin', 'supplier'],
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

  // MANAGEMENT
  {
    heading: 'Management',
    roles: ['admin'],
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
    .filter(section => section.roles?.includes(userRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles?.includes(userRole)),
    }))
    .filter(section => section.items.length > 0)
}

// Helper function to filter bottom menu by role
export function filterBottomMenuByRole(menu: NavMenuItems, userRole: string): NavMenuItems {
  return menu.filter(item => item.roles?.includes(userRole))
}
