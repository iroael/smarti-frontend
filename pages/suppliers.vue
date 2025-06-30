<script setup lang="ts">
import { columns } from '@/components/supplier/components/columns'
import DataTable from '@/components/supplier/components/DataTable.vue'
import { useSuppliers } from '@/composables/useSupplier'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { suppliers, loading, fetchSuppliers } = useSuppliers()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

// Handler ketika supplier berhasil dihapus
const handleDeleteSuccess = async () => {
  await fetchSuppliers()
}

// ✅ FIX: Panggil fungsi `columns` di sini
const columnsData = columns(handleDeleteSuccess)

onMounted(async () => {
  await fetchSuppliers()
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Mitra Bisnis
        </h2>
        <p class="text-muted-foreground">
          Here's a list of all registered mitra bisnis.
        </p>
      </div>

      <!-- Tombol tambah supplier hanya untuk admin -->
      <NuxtLink v-if="isAdmin" to="/supplier/create">
        <button class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
          + Add Supplier
        </button>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-muted-foreground">
      <div class="inline-flex items-center gap-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        Loading suppliers...
      </div>
    </div>

    <!-- DataTable untuk Admin -->
    <DataTable
      v-else-if="isAdmin"
      :data="suppliers"
      :columns="columnsData"
    />

    <!-- Empty State -->
    <div v-if="!loading && suppliers.length === 0" class="text-center py-12 text-muted-foreground">
      <div class="text-6xl mb-4">🏭</div>
      <p class="text-xl font-medium mb-2">No suppliers found</p>
      <p class="text-sm">Start by adding your first supplier.</p>
    </div>

    <!-- Fallback jika bukan admin -->
    <div v-if="!loading && !isAdmin" class="text-center py-12 text-muted-foreground">
      <div class="text-6xl mb-4">🔒</div>
      <p class="text-xl font-medium mb-2">Access Restricted</p>
      <p class="text-sm">You don't have permission to view this content.</p>
    </div>
  </div>
</template>
