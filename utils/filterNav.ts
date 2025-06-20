import type { NavMenu } from '~/types/nav'

export function filterNavByRole(menus: NavMenu[], role: string): NavMenu[] {
  return menus
    .map((section) => {
      const filteredItems = section.items
        .map((item) => {
          if ('heading' in item) return item

          if ('children' in item) {
            if (item.roles && !item.roles.includes(role)) return null

            const filteredChildren = item.children.filter(
              (child) => !child.roles || child.roles.includes(role)
            )
            return filteredChildren.length > 0
              ? { ...item, children: filteredChildren }
              : null
          }

          return !item.roles || item.roles.includes(role) ? item : null
        })
        .filter(Boolean)

      return filteredItems.length > 0 ? { ...section, items: filteredItems } : null
    })
    .filter(Boolean) as NavMenu[]
}
