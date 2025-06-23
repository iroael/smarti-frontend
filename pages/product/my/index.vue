<script setup lang="ts">
import { columns } from '@/components/product/components/columns'
import DataTable from '@/components/product/components/DataTable.vue'
import ProductCard from '@/components/product/components/ProductCard.vue'
import { useProducts } from '@/composables/useProducts'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { products, loading, fetchProductsByRole } = useProducts()
const authStore = useAuthStore()

// Computed properties untuk menentukan role user
const isCustomer = computed(() => {
  return authStore.user?.role === 'customer'
})

const isAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

const isSupplier = computed(() => {
  return authStore.user?.role === 'supplier'
})

// Computed property untuk menentukan view mode berdasarkan role
const viewMode = computed(() => {
  if (isCustomer.value) return 'cards' // Customer sees cards
  if (isSupplier.value) return 'table' // Supplier sees table
  if (isAdmin.value) return 'table' // Admin sees table
  return 'restricted' // Other roles restricted
})

// Computed property untuk data yang akan ditampilkan
const displayData = computed(() => {
  if (isCustomer.value) {
    // Customer hanya melihat bundle products
    return products.value.filter(p => p.is_bundle === true)
  }
  // Supplier dan Admin melihat semua produk mereka
  return products.value
})

// Computed property untuk menentukan grid columns berdasarkan jumlah produk
const gridCols = computed(() => {
  const count = displayData.value?.length || 0
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
})

// Computed property untuk title dan description berdasarkan role
const pageTitle = computed(() => {
  if (isCustomer.value) return 'Available Bundles'
  if (isSupplier.value) return 'My Products'
  if (isAdmin.value) return 'All Products'
  return 'Products'
})

const pageDescription = computed(() => {
  if (isCustomer.value) return "Here's a list of available product bundles for you."
  if (isSupplier.value) return "Manage your products and bundles."
  if (isAdmin.value) return "Manage all products in the system."
  return "Product management"
})

// Computed property untuk loading message
const loadingMessage = computed(() => {
  if (isCustomer.value) return 'Loading bundles...'
  if (isSupplier.value) return 'Loading your products...'
  if (isAdmin.value) return 'Loading all products...'
  return 'Loading products...'
})

// Computed property untuk empty state message
const emptyStateConfig = computed(() => {
  if (isCustomer.value) {
    return {
      icon: '📦',
      title: 'No bundles available',
      description: 'Please check back later for available product bundles.'
    }
  }
  if (isSupplier.value) {
    return {
      icon: '📋',
      title: 'No products found',
      description: 'Start by adding your first product to get started.'
    }
  }
  if (isAdmin.value) {
    return {
      icon: '📊',
      title: 'No products in system',
      description: 'No products have been created yet.'
    }
  }
  return {
    icon: '🔒',
    title: 'Access Restricted',
    description: "You don't have permission to view this content."
  }
})
console.log('isSupplier',isSupplier.value)
console.log('isCustomer',isCustomer.value)
console.log('isAdmin',isAdmin.value)
onMounted(async () => {
  try {
    // Use role-based fetching for all authenticated users
    if (isCustomer.value || isSupplier.value || isAdmin.value) {
      await fetchProductsByRole()
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  }
})

// Handler dipanggil saat 1 produk berhasil dihapus
const handleDeleteSuccess = async () => {
  try {
    if (isCustomer.value || isSupplier.value || isAdmin.value) {
      await fetchProductsByRole()
    }
  } catch (error) {
    console.error('Failed to refresh products:', error)
  }
}

// Handler untuk view mode switching (opsional untuk future enhancement)
const toggleViewMode = () => {
  // Future enhancement: allow suppliers to switch between table and card view
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <!-- Header Section -->
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ pageTitle }}
        </h2>
        <p class="text-muted-foreground">
          {{ pageDescription }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-muted-foreground">
      <div class="inline-flex items-center gap-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        {{ loadingMessage }}
      </div>
    </div>

    <!-- Content based on view mode -->
    <template v-else>
      <!-- Table View - Admin & Supplier -->
      <DataTable
        v-if="viewMode === 'table'"
        :data="displayData"
        :columns="columns(handleDeleteSuccess)"
        class="border rounded-lg"
      />

      <!-- Cards View - Customer -->
      <div
        v-else-if="viewMode === 'cards'"
        :class="`grid ${gridCols} gap-6`"
      >
        <ProductCard
          v-for="product in displayData"
          :key="product.id"
          :product="product"
          class="h-full"
        />
      </div>

      <!-- Restricted Access -->
      <div v-else-if="viewMode === 'restricted'" class="text-center py-12 text-muted-foreground">
        <div class="text-6xl mb-4">🔒</div>
        <p class="text-xl font-medium mb-2">Access Restricted</p>
        <p class="text-sm">You don't have permission to view this content.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>