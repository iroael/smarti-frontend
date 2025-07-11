<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Product } from '@/types/schema'
import { ref, computed } from 'vue'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'

const props = defineProps<{ row: Row<Product> }>()
const emit = defineEmits(['deleteSuccess'])

const router = useRouter()
const { toast } = useToast()
const { deleteProduct } = useProducts()

const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const product = computed(() => props.row.original)

const handleDelete = async () => {
  try {
    isDeleting.value = true
    await deleteProduct(product.value.id)
    toast({
      title: 'Produk dihapus',
      description: `Produk "${product.value.name}" berhasil dihapus.`,
      variant: 'success',
    })
    showDeleteDialog.value = false
    emit('deleteSuccess', product.value.id)
  } catch (err: any) {
    toast({
      title: 'Gagal menghapus',
      description: err?.message || 'Terjadi kesalahan saat menghapus produk.',
      variant: 'destructive',
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-8 w-8 flex p-0 data-[state=open]:bg-muted">
        <Icon name="i-radix-icons-dots-horizontal" class="h-4 w-4" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-[160px]">
      <DropdownMenuItem @click="router.push(`/product/view/${product.id}`)">
        View
      </DropdownMenuItem>
      <DropdownMenuItem @click="showDeleteDialog = true" class="text-red-500 focus:text-red-500">
        Delete
        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Dialog -->
  <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Hapus Produk</DialogTitle>
        <DialogDescription>
          Apakah Anda yakin ingin menghapus <strong>{{ product.name }}</strong>? Tindakan ini tidak dapat dibatalkan.
        </DialogDescription>
      </DialogHeader>
      <div class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="showDeleteDialog = false" :disabled="isDeleting">Batal</Button>
        <Button variant="destructive" @click="handleDelete" :disabled="isDeleting">
          <span v-if="isDeleting" class="flex items-center gap-2">
            <Icon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
            Menghapus...
          </span>
          <span v-else>Hapus</span>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
