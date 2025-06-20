// ~/constants/menus.ts
import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'General',
    items: [
      {
        title: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        link: '/',
        roles: ['admin', 'supplier', 'customer'],
      },
      {
        title: 'Account',
        icon: 'i-lucide-user-cog',
        link: '/account',
        roles: ['supplier', 'customer'],
      },
    ],
  },
  {
    heading: 'Business',
    items: [
      {
        title: 'Products',
        icon: 'i-lucide-box',
        link: '/product',
        roles: ['admin', 'supplier', 'customer'],
      },
      {
        title: 'My Orders',
        icon: 'i-lucide-package',
        link: '/sales-order',
        roles: ['customer'],
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
    heading: 'Master',
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
      {
        title: 'Inventory',
        icon: 'i-lucide-warehouse',
        link: '/inventory',
        roles: ['admin', 'supplier'],
      },
    ],
  },
  {
    heading: 'Reports',
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
    title: 'Help & Support',
    icon: 'i-lucide-circle-help',
    link: '/help',
    roles: ['admin', 'supplier', 'customer'],
  },
  {
    title: 'Documentation',
    icon: 'i-lucide-book-open',
    link: '/docs',
    roles: ['admin', 'supplier', 'customer'],
  },
]

// Helper function to filter menu items by role
export function filterMenuByRole(menu: NavMenu[], userRole: string): NavMenu[] {
  return menu
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Handle different item types
        if ('roles' in item && item.roles) {
          return item.roles.includes(userRole)
        }
        // If no roles specified, allow access (for section titles)
        if ('heading' in item) return true
        // Default allow if no roles specified
        return !('roles' in item) || !item.roles
      })
    }))
    .filter(section => section.items.length > 0) // Remove empty sections
}

// Helper function to filter bottom menu by role
export function filterBottomMenuByRole(menu: NavMenuItems, userRole: string): NavMenuItems {
  return menu.filter(item => {
    if ('roles' in item && item.roles) {
      return item.roles.includes(userRole)
    }
    // Default allow if no roles specified
    return true
  })
}