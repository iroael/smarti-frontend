<script setup lang="ts">
import { ref } from 'vue'
import AddCustomerModal from '@/components/customers/components/AddCustomerModal.vue'
import { columns } from '@/components/customers/components/columns'
import DataTable from '@/components/customers/components/DataTable.vue'
import { useCustomers } from '@/composables/useCustomers'

// Ambil data & methods dari composable
const { customers, loading: isLoading, error, fetchCustomers, createCustomer } = useCustomers()

// Load data saat mount
onMounted(() => {
  fetchCustomers()
})

// State untuk modal tambah customer
const showAddModal = ref(false)

// Submit handler dari modal
const handleAddCustomer = async (data: any) => {
  try {
    await createCustomer(data)
    showAddModal.value = false
    await fetchCustomers()
  } catch (err) {
    console.error('Failed to add customer:', err)
  }
}


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
          Customers
        </h2>
        <p class="text-muted-foreground">
          Here’s a list of all registered customers.
        </p>
      </div>
      <Button variant="default" @click="showAddModal = true">
        + Add Customer
      </Button>
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

    <AddCustomerModal
      :open="showAddModal"
      @close="showAddModal = false"
      @submit="handleAddCustomer"
    />
  </div>
</template>

<style scoped>
</style>
