<script setup lang="ts">
import { columns } from '@/components/product/components/columns'
import DataTable from '@/components/product/components/DataTable.vue'
import { useProducts } from '@/composables/useProducts'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from 'vue-router'

// Composables
const route = useRoute()
const { nonBundleProducts, loading, fetchProductNonBundle } = useProducts()
const authStore = useAuthStore()

// Role Computed
const isCustomer = computed(() => authStore.user?.role === 'customer')
const isAdmin = computed(() => authStore.user?.role === 'admin')

// Detect view type from URL
const viewType = computed(() => {
  if (route.path.includes('/product/price')) return 'price'
  if (route.path.includes('/product/bundling')) return 'bundling'
  return 'item'
})

onMounted(async () => {
  await fetchProductNonBundle()
})

// Refresh handler after delete
const handleDeleteSuccess = async () => {
  await fetchProductNonBundle()
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ isCustomer ? 'Available ' : 'Master Harga' }}
        </h2>
        <p class="text-muted-foreground">
          {{ isCustomer
            ? "Here's a list of available product bundles for you." 
            : "Here's a list of available products and bundles."
          }}
        </p>
      </div>

      <!-- Admin only: Add product -->
      <NuxtLink v-if="isAdmin" to="/product/create?type=nonbundling">
        <button class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
          + Add Product
        </button>
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8 text-muted-foreground">
      <div class="inline-flex items-center gap-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        Loading {{ isCustomer ? 'bundles' : 'products' }}...
      </div>
    </div>

    <!-- Admin DataTable -->
    <DataTable
      v-else-if="isAdmin"
      :data="nonBundleProducts"
      :columns="columns(handleDeleteSuccess, { role: authStore.user?.role, viewType })"
    />

    <!-- Empty state -->
    <div
      v-if="!loading && nonBundleProducts.length === 0 && isAdmin"
      class="text-center py-12 text-muted-foreground"
    >
      <div class="text-6xl mb-4">📋</div>
      <p class="text-xl font-medium mb-2">No products found</p>
      <p class="text-sm">Start by adding your first product.</p>
    </div>

    <!-- Fallback role -->
    <div
      v-if="!loading && !isAdmin && !isCustomer"
      class="text-center py-12 text-muted-foreground"
    >
      <div class="text-6xl mb-4">🔒</div>
      <p class="text-xl font-medium mb-2">Access Restricted</p>
      <p class="text-sm">You don't have permission to view this content.</p>
    </div>
  </div>
</template>
