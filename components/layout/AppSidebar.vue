<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { navMenu, navMenuBottom, filterMenuByRole, filterBottomMenuByRole } from '~/constants/menus'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { sidebar } = useAppSettings()

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const role = computed(() => authStore.user?.role || 'guest')

// Filter menu items based on user role
const filteredNavMenu = computed(() => {
  const currentRole = role.value
  if (currentRole === 'guest') return []

  return filterMenuByRole(navMenu, currentRole)
})

// Filter bottom menu items based on user role
const filteredNavMenuBottom = computed(() => {
  const currentRole = role.value
  if (currentRole === 'guest') return []

  return filterBottomMenuByRole(navMenuBottom, currentRole)
})

const teams = [
  {
    name: 'SMARTI.ID',
    logo: 'i-lucide-gallery-vertical-end',
    plan: role,
  },
]

onMounted(async () => {
  if (!authStore.token) return
  if (!authStore.user) {
    await authStore.fetchProfile()
  }
})

const user = computed(() => {
  const u = authStore.user
  return {
    name: u?.profile.name || 'Unknown',
    email: u?.email || '',
    avatar: u?.avatar || '/avatars/default.png',
    npwp: u?.profile.npwp || '',
    role: u?.role || 'guest',
  }
})
</script>

<template>
  <Sidebar :collapsible="sidebar.collapsible" :side="sidebar.side" :variant="sidebar.variant">
    <SidebarHeader>
      <LayoutSidebarNavHeader :teams="teams" />
      <Search />
    </SidebarHeader>

    <SidebarContent>
      <!-- Show message if user is guest or no menu items available -->
      <div v-if="role === 'guest' || filteredNavMenu.length === 0" class="p-4 text-center text-muted-foreground">
        <p>No menu items available for your role.</p>
      </div>

      <!-- Render filtered menu items -->
      <SidebarGroup v-for="(nav, indexGroup) in filteredNavMenu" :key="indexGroup">
        <SidebarGroupLabel v-if="nav.heading">
          {{ nav.heading }}
        </SidebarGroupLabel>
        <component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in nav.items"
          :key="index"
          :item="item"
        />
      </SidebarGroup>

      <!-- Bottom menu items -->
      <SidebarGroup v-if="filteredNavMenuBottom.length > 0" class="mt-auto">
        <component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in filteredNavMenuBottom"
          :key="index"
          :item="item"
          size="sm"
        />
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <LayoutSidebarNavFooter :user="user" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<style scoped>
</style>