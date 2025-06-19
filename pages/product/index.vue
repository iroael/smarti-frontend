<script setup lang="ts">
import { columns } from '@/components/product/components/columns'
import DataTable from '@/components/product/components/DataTable.vue'
import { useProducts } from '@/composables/useProducts'
import { onMounted } from 'vue'

const { products, loading, fetchProducts } = useProducts()

onMounted(() => {
  fetchProducts()
})

// Handler dipanggil saat 1 produk berhasil dihapus
const handleDeleteSuccess = async () => {
  await fetchProducts()
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Products</h2>
        <p class="text-muted-foreground">
          Here's a list of available products and bundles.
        </p>
      </div>

      <NuxtLink to="/product/create">
        <button class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
          + Add Product
        </button>
      </NuxtLink>
    </div>

    <DataTable
      v-if="!loading"
      :data="products"
      :columns="columns(handleDeleteSuccess)"
    />

    <div v-else class="text-center py-4 text-muted-foreground">
      Loading products...
    </div>
  </div>
</template>
