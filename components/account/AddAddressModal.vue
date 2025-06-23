<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@/components/ui/toast'
import { useAddress } from '@/composables/useAddress' // Ganti dari useCustomers ke useAddress

const emit = defineEmits<{ (e: 'close'): void }>()
const props = defineProps<{ open: boolean }>()

const form = ref({
  name: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalcode: '',
  is_default: false,
  is_deleted: false,
})

const { createAddress, getOwnerInfo } = useAddress() // Menggunakan useAddress composable
const { toast } = useToast()

// Reset form saat modal dibuka
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      form.value = {
        name: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalcode: '',
        is_default: false,
        is_deleted: false,
      }

      // Debug: Cek owner info saat modal dibuka
      try {
        const ownerInfo = getOwnerInfo()
        console.log('[AddressForm] Modal dibuka - Owner info:', ownerInfo)
      } catch (error) {
        console.error('[AddressForm] Error getting owner info:', error)
        toast({
          title: 'Error',
          description: 'User tidak terautentikasi',
          variant: 'destructive',
        })
      }
    }
  }
)

const handleSubmit = async () => {
  try {
    console.log('[AddressForm] Submitting form data:', form.value)
    
    // Panggil createAddress yang sudah ada debug console
    await createAddress(form.value)
    
    toast({
      title: 'Berhasil',
      description: 'Alamat berhasil ditambahkan.',
      variant: 'success',
    })
    emit('close')
  } catch (error) {
    console.error('[AddressForm] Gagal menambahkan alamat:', error)
    toast({
      title: 'Gagal',
      description: 'Tidak dapat menyimpan alamat.',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <Dialog :open="open" @close="emit('close')">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Tambah Alamat</DialogTitle>
        <DialogDescription>
          Lengkapi form berikut untuk menyimpan alamat pengiriman.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <Input v-model="form.name" placeholder="Nama" />
        <Input v-model="form.phone" placeholder="Telepon" />
        <Textarea v-model="form.address" placeholder="Alamat Lengkap" />
        <Input v-model="form.city" placeholder="Kota" />
        <Input v-model="form.province" placeholder="Provinsi" />
        <Input v-model="form.postalcode" placeholder="Kode Pos" />
        
        <div class="flex items-center space-x-2">
          <input 
            id="is_default" 
            v-model="form.is_default" 
            type="checkbox" 
            class="rounded border-gray-300"
          />
          <label for="is_default" class="text-sm font-medium">
            Jadikan alamat utama
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('close')">Batal</Button>
        <Button @click="handleSubmit">Simpan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>