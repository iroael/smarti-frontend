<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@/components/ui/toast'
import { useCustomers } from '@/composables/useCustomers'

const emit = defineEmits<{ (e: 'close'): void }>()
const props = defineProps<{ open: boolean }>()

const customerId = ref<number | null>(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalcode: '',
})

const { addCustomerAddress, getCurrentCustomer } = useCustomers()
const { toast } = useToast()

// Reset form saat modal dibuka
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      form.value = {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalcode: '',
      }

      try {
        const { data } = await getCurrentCustomer()
        customerId.value = data.id
      }
      catch (error) {
        toast({
          title: 'Gagal ambil data user',
          description: 'Silakan coba lagi',
          variant: 'destructive',
        })
      }
    }
  }
)


const handleSubmit = async () => {
  try {
    await addCustomerAddress(customerId.value, form.value)
    toast({
      title: 'Berhasil',
      description: 'Alamat berhasil ditambahkan.',
      variant: 'success',
    })
    emit('close')
  } catch (error) {
    console.error('Gagal menambahkan alamat:', error)
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
        <Input v-model="form.email" placeholder="Email" type="email" />
        <Input v-model="form.phone" placeholder="Telepon" />
        <Textarea v-model="form.address" placeholder="Alamat Lengkap" />
        <Input v-model="form.city" placeholder="Kota" />
        <Input v-model="form.province" placeholder="Provinsi" />
        <Input v-model="form.postalcode" placeholder="Kode Pos" />
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('close')">Batal</Button>
        <Button @click="handleSubmit">Simpan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
