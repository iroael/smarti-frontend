<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Product } from '@/types/schema'
import { ref, computed } from 'vue'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'vue-router'
import { useCustomers } from '@/composables/useCustomers'

const props = defineProps<{ row: Row<Product> }>()
const emit = defineEmits(['deleteSuccess'])

const router = useRouter()
const { toast } = useToast()
const { deleteCustomer } = useCustomers()

const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const customer = computed(() => props.row.original)

const handleDelete = async () => {
  try {
    isDeleting.value = true
    await deleteCustomer(customer.value.id)
    toast({
      title: 'Customer dihapus',
      description: `Customer "${customer.value.name}" berhasil dihapus.`,
      variant: 'success',
    })
    showDeleteDialog.value = false
    emit('deleteSuccess', customer.value.id)
  }
  catch (err: any) {
    toast({
      title: 'Gagal menghapus',
      description: err?.message || 'Terjadi kesalahan saat menghapus produk.',
      variant: 'destructive',
    })
  }
  finally {
    isDeleting.value = false
  }
}

const goToDetail = () => {
  // Gunakan id dari data yang ada
  const customerId = customer.value.id
  if (customerId) {
    router.push(`/customers/${customerId}/view`)
  } else {
    console.error('No order ID found')
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="h-8 w-8 flex p-0 data-[state=open]:bg-muted"
      >
        <Icon name="i-radix-icons-dots-horizontal" class="h-4 w-4" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[160px]">
      <DropdownMenuItem @click="goToDetail">
        View
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleDelete">
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
