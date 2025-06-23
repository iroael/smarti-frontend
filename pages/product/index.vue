<script setup lang="ts">
import ProductCard from '@/components/product/components/ProductCard.vue'
import { useProducts } from '@/composables/useProducts'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { products, loading, fetchProductsByRole } = useProducts()
const authStore = useAuthStore()

// Computed property untuk menentukan role user
const isCustomer = computed(() => {
  return authStore.user?.role === 'customer'
})
// Computed property untuk menentukan grid columns berdasarkan jumlah produk
const gridCols = computed(() => {
  const count = products.value?.length || 0
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
})

onMounted(async () => {
  console.log(isCustomer.value)
  if (isCustomer.value) {
    await fetchProductsByRole()
  }
})

</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          {{ isCustomer ? 'Available Bundles' : 'My Products' }}
        </h2>
        <p class="text-muted-foreground">
          {{ isCustomer
            ? "Here's a list of available product bundles for you." 
            : "Here's a list of available products and bundles."
          }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-muted-foreground">
      <div class="inline-flex items-center gap-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        Loading {{ isCustomer ? 'bundles' : 'products' }}...
      </div>
    </div>

    <!-- Customer View - Cards Grid (Dynamic columns based on product count) -->
    <div v-else-if="isCustomer" :class="`grid ${gridCols} gap-6`">
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

    <!-- Fallback for other roles -->
    <div v-if="!loading && !isCustomer" class="text-center py-12 text-muted-foreground">
      <div class="text-6xl mb-4">🔒</div>
      <p class="text-xl font-medium mb-2">Access Restricted</p>
      <p class="text-sm">You don't have permission to view this content.</p>
    </div>
  </div>
</template>