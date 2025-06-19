<script setup lang="ts">
import AlertDialog from '@/components/account/AlertDialog.vue'
import AddAddressModal from '@/components/account/AddAddressModal.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useCustomers } from '@/composables/useCustomers'
import { 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Plus,
  Home,
  Building2,
  MoreVertical
} from 'lucide-vue-next'
import { onMounted, ref, computed } from 'vue'

const { getCurrentCustomer, setDefaultCustomerAddress, deleteAddressCustomer } = useCustomers()
const { toast } = useToast()

const addresses = ref<any[]>([])
const loading = ref(true)
const showAddressForm = ref(false)
const showConfirmModal = ref(false)
const showDeleteModal = ref(false)
const selectedAddressId = ref<number | null>(null)
const deleteLoading = ref(false)

const defaultAddress = computed(() => addresses.value.find(addr => addr.isDefault))
const otherAddresses = computed(() => addresses.value.filter(addr => !addr.isDefault))

const fetchCustomerAddresses = async () => {
  try {
    const { data } = await getCurrentCustomer()
    addresses.value = data.addresses.map((addr: any) => ({
      id: addr.id,
      label: addr.label ?? addr.name,
      name: addr.name,
      phone: addr.phone,
      email: addr.email,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalcode,
      isDefault: addr.is_default,
    }))
  }
  catch (error) {
    console.error('Gagal mengambil alamat:', error)
    toast({
      title: 'Error',
      description: 'Gagal memuat daftar alamat',
      variant: 'destructive',
    })
  }
}

function openConfirmModal(addressId: number) {
  selectedAddressId.value = addressId
  showConfirmModal.value = true
}

function openDeleteModal(addressId: number) {
  selectedAddressId.value = addressId
  showDeleteModal.value = true
}

async function confirmSetDefault() {
  if (selectedAddressId.value === null) return

  try {
    await setDefaultCustomerAddress(1, selectedAddressId.value)
    await fetchCustomerAddresses()

    toast({
      title: 'Berhasil!',
      description: 'Alamat utama berhasil diperbarui.',
      variant: 'success',
    })
  }
  catch (error) {
    toast({
      title: 'Gagal',
      description: 'Tidak dapat mengubah alamat utama.',
      variant: 'destructive',
    })
  }
  finally {
    showConfirmModal.value = false
    selectedAddressId.value = null
  }
}

async function confirmDelete() {
  if (selectedAddressId.value === null) return

  deleteLoading.value = true
  try {
    await deleteAddressCustomer(selectedAddressId.value)
    await fetchCustomerAddresses()

    toast({
      title: 'Berhasil!',
      description: 'Alamat berhasil dihapus.',
      variant: 'success',
    })
  }
  catch (error) {
    console.error('Error deleting address:', error)
    toast({
      title: 'Gagal',
      description: 'Tidak dapat menghapus alamat. Silakan coba lagi.',
      variant: 'destructive',
    })
  }
  finally {
    deleteLoading.value = false
    showDeleteModal.value = false
    selectedAddressId.value = null
  }
}

onMounted(async () => {
  loading.value = true
  await fetchCustomerAddresses()
  loading.value = false
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight">Alamat Saya</h1>
        <p class="text-muted-foreground">
          Kelola alamat pengiriman dan penagihan Anda
        </p>
      </div>
      <Button 
        @click="showAddressForm = true" 
        class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <Plus class="w-4 h-4 mr-2" />
        Tambah Alamat Baru
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card v-for="i in 4" :key="i" class="overflow-hidden">
          <CardContent class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <Skeleton class="h-6 w-32" />
                <Skeleton class="h-5 w-16" />
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-28" />
                </div>
                <div class="flex items-center gap-3">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-36" />
                </div>
                <div class="flex items-start gap-3">
                  <Skeleton class="h-4 w-4" />
                  <div class="flex-1 space-y-2">
                    <Skeleton class="h-4 w-full" />
                    <Skeleton class="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="addresses.length > 0" class="space-y-6">
      <!-- Default Address Section -->
      <div v-if="defaultAddress" class="space-y-3">
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-amber-500 fill-current" />
          <h2 class="text-lg font-semibold">Alamat Utama</h2>
        </div>
        
        <Card class="border-2 border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50 shadow-lg">
          <CardContent class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Home class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg text-gray-900">{{ defaultAddress.name }}</h3>
                    <Badge variant="secondary" class="bg-green-100 text-green-800 hover:bg-green-100 mt-1">
                      <Star class="w-3 h-3 mr-1 fill-current" />
                      Alamat Utama
                    </Badge>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ml-13">
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 text-sm">
                      <Phone class="w-4 h-4 text-gray-500" />
                      <span class="font-medium">{{ defaultAddress.phone }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <Mail class="w-4 h-4 text-gray-500" />
                      <span>{{ defaultAddress.email }}</span>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 text-sm">
                    <MapPin class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div class="leading-relaxed">
                      <p class="font-medium">{{ defaultAddress.address }}</p>
                      <p class="text-gray-600">{{ defaultAddress.city }}, {{ defaultAddress.province }} {{ defaultAddress.postalCode }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <Button variant="ghost" size="sm" class="h-9 w-9 p-0 hover:bg-green-100">
                  <Edit2 class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Other Addresses Section -->
      <div v-if="otherAddresses.length > 0" class="space-y-3">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <Building2 class="w-5 h-5 text-gray-600" />
          Alamat Lainnya
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card
            v-for="address in otherAddresses"
            :key="address.id"
            class="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border border-gray-200 hover:border-gray-300"
          >
            <CardContent class="p-6">
              <div class="space-y-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Building2 class="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 class="font-semibold text-lg">{{ address.name }}</h3>
                  </div>
                  
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical class="w-4 h-4" />
                  </Button>
                </div>

                <div class="space-y-3 text-sm ml-11">
                  <div class="flex items-center gap-3">
                    <Phone class="w-4 h-4 text-gray-500" />
                    <span class="font-medium">{{ address.phone }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <Mail class="w-4 h-4 text-gray-500" />
                    <span>{{ address.email }}</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <MapPin class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div class="leading-relaxed">
                      <p class="font-medium">{{ address.address }}</p>
                      <p class="text-gray-600">{{ address.city }}, {{ address.province }} {{ address.postalCode }}</p>
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-100 flex items-center justify-between ml-11">
                  <Button
                    variant="link"
                    @click="openConfirmModal(address.id)"
                    class="text-green-600 hover:text-green-700 p-0 h-auto font-medium text-sm"
                  >
                    <Star class="w-3 h-3 mr-1" />
                    Jadikan Utama
                  </Button>

                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                      <Edit2 class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      @click="openDeleteModal(address.id)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="!loading" class="text-center py-12">
      <CardContent class="space-y-4">
        <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <MapPin class="w-8 h-8 text-gray-400" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Belum Ada Alamat</h3>
          <p class="text-muted-foreground max-w-sm mx-auto">
            Tambahkan alamat pertama Anda untuk memudahkan proses pengiriman
          </p>
        </div>
        <Button 
          @click="showAddressForm = true"
          class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <Plus class="w-4 h-4 mr-2" />
          Tambah Alamat Pertama
        </Button>
      </CardContent>
    </Card>

    <!-- Modals -->
    <AlertDialog
      v-model="showConfirmModal"
      title="Konfirmasi Perubahan"
      description="Apakah Anda yakin ingin menjadikan alamat ini sebagai alamat utama? Alamat utama sebelumnya akan berubah menjadi alamat biasa."
      @confirm="confirmSetDefault"
      @cancel="showConfirmModal = false"
    />

    <AlertDialog
      v-model="showDeleteModal"
      title="Hapus Alamat"
      description="Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan."
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      :loading="deleteLoading"
      confirmText="Hapus"
      confirmVariant="destructive"
    />

    <AddAddressModal 
      :open="showAddressForm" 
      @close="() => {
        showAddressForm = false
        fetchCustomerAddresses()
      }"
    />
  </div>
</template>
