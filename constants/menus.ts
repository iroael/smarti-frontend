import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'General',
    items: [
      {
        title: 'Home',
        icon: 'i-lucide-home',
        link: '/',
      },
      {
        title: 'Account',
        icon: 'i-lucide-user-cog',
        link: '/account',
      },
      {
        title: 'New Account',
        icon: 'i-lucide-user-cog',
        link: '/new-account',
      },
    ],
  },
  // 👉 New Section: Business
  {
    heading: 'Business',
    items: [
      {
        title: 'Customers',
        icon: 'i-lucide-users',
        link: '/customers',
      },
      {
        title: 'Product',
        icon: 'i-lucide-box',
        link: '/product',
      },
      {
        title: 'Sales Order',
        icon: 'i-lucide-file-text',
        link: '/sales-order',
      },
    ],
  },
  {
    heading: 'Settings',
    items: [
      {
        title: 'Settings',
        icon: 'i-lucide-settings',
        new: true,
        children: [
          {
            title: 'Profile',
            icon: 'i-lucide-circle',
            link: '/settings/profile',
          },
          {
            title: 'Account',
            icon: 'i-lucide-circle',
            link: '/settings/account',
          },
          {
            title: 'Appearance',
            icon: 'i-lucide-circle',
            link: '/settings/appearance',
          },
          {
            title: 'Notifications',
            icon: 'i-lucide-circle',
            link: '/settings/notifications',
          },
          {
            title: 'Display',
            icon: 'i-lucide-circle',
            link: '/settings/display',
          },
        ],
      },
    ],
  },
]

export const navMenuBottom: NavMenuItems = [
  {
    title: 'Help & Support',
    icon: 'i-lucide-circle-help',
    link: 'https://github.com/dianprata/nuxt-shadcn-dashboard',
  },
]
