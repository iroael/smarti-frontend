<script setup lang="ts">
import AddCustomerModal from '@/components/customers/components/AddCustomerModal.vue'
import { columns } from '@/components/customers/components/columns'
import DataTable from '@/components/customers/components/DataTable.vue'
import { useCustomers } from '@/composables/useCustomers'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Ambil data & methods dari composable
const { customers, loading: isLoading, error, fetchCustomers, createCustomer } = useCustomers()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

// Load data saat mount
onMounted(() => {
  fetchCustomers()
})


// Handler dipanggil saat 1 produk berhasil dihapus
const handleDeleteSuccess = async () => {
  await fetchCustomers()
}
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Pengembang Rumah Subsidi
        </h2>
        <p class="text-muted-foreground">
          Berikut daftar semua pengembang rumah subsidi yang terdaftar.
        </p>
      </div>

      <!-- Tombol tambah supplier hanya untuk admin -->
      <NuxtLink v-if="isAdmin" to="/customers/create">
        <button class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
          + Add Mitra Bisnis
        </button>
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center text-muted-foreground py-10">
      Loading customers...
    </div>

    <div v-else-if="error" class="text-red-500 py-10">
      Failed to load customers: {{ error.message }}
    </div>

    <DataTable
      v-else
      :data="customers || []"
      :columns="columns(handleDeleteSuccess)"
    />
  </div>
</template>

<style scoped>
</style>
