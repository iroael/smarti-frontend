<script setup lang="ts">
import { columns } from '@/components/product/components/columns'
import DataTable from '@/components/product/components/DataTable.vue'
import ProductCard from '@/components/product/components/ProductCard.vue'
import { useProducts } from '@/composables/useProducts'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { products, bundleProducts, loading, fetchProducts, fetchBundleProducts, fetchProductsByRole } = useProducts()
const authStore = useAuthStore()

// Computed property untuk menentukan role user
const isCustomer = computed(() => {
  return authStore.user?.role === 'customer'
})

const isAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

// Computed property untuk data yang akan ditampilkan
const displayData = computed(() => {
  if (isCustomer.value) {
    return bundleProducts.value
  }
  return products.value
})

onMounted(async () => {
  if (isCustomer.value) {
    await fetchProductsByRole()
  } else {
    await fetchProducts()
  }
})

// Handler dipanggil saat 1 produk berhasil dihapus
const handleDeleteSuccess = async () => {
  if (isCustomer.value) {
    await fetchBundleProducts()
  } else {
    await fetchProducts()
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ isCustomer ? 'Available Bundles' : 'Products' }}
        </h2>
        <p class="text-muted-foreground">
          {{ isCustomer
            ? "Here's a list of available product bundles for you." 
            : "Here's a list of available products and bundles."
          }}
        </p>
      </div>

      <!-- Hanya tampilkan tombol Add Product jika admin -->
      <NuxtLink v-if="isAdmin" to="/product/create">
        <button class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
          + Add Product
        </button>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-muted-foreground">
      <div class="inline-flex items-center gap-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        Loading {{ isCustomer ? 'bundles' : 'products' }}...
      </div>
    </div>

    <!-- Admin View - DataTable -->
    <DataTable
      v-else-if="isAdmin"
      :data="products"
      :columns="columns(handleDeleteSuccess)"
    />

    <!-- Customer View - Cards Grid -->
    <div v-else-if="isCustomer">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Empty State for Customer -->
    <div v-if="!loading && products.length === 0 && isCustomer" class="text-center py-12 text-muted-foreground">
      <div class="text-6xl mb-4">📦</div>
      <p class="text-xl font-medium mb-2">No bundles available</p>
      <p class="text-sm">Please check back later for available product bundles.</p>
    </div>

    <!-- Empty State for Admin -->
    <div v-if="!loading && products.length === 0 && isAdmin" class="text-center py-12 text-muted-foreground">
      <div class="text-6xl mb-4">📋</div>
      <p class="text-xl font-medium mb-2">No products found</p>
      <p class="text-sm">Start by adding your first product.</p>
    </div>

    <!-- Fallback for other roles -->
    <div v-if="!loading && !isAdmin && !isCustomer" class="text-center py-12 text-muted-foreground">
      <div class="text-6xl mb-4">🔒</div>
      <p class="text-xl font-medium mb-2">Access Restricted</p>
      <p class="text-sm">You don't have permission to view this content.</p>
    </div>
  </div>
</template>