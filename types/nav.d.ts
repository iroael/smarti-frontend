// types/nav.d.ts
export interface NavLink {
  title: string
  link: string
  icon?: string
  new?: boolean
  roles?: string[]
}

export interface NavSectionTitle {
  heading: string
}

export interface NavGroup {
  title: string
  icon?: string
  new?: boolean
  roles?: string[]
  children: NavLink[]
}

export interface NavMenu {
  heading: string
  roles?: string[] // ⬅ Tambahkan roles untuk heading
  items: NavMenuItems
}

export declare type NavMenuItems = (NavLink | NavGroup | NavSectionTitle)[]
