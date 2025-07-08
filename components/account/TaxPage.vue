<script setup lang="ts">
import { useToast } from '@/components/ui/toast'
import { onMounted, ref } from 'vue'
import { useTaxIdentifications } from '~/composables/useTaxIdentifications'

const { toast } = useToast()

// Tax type options
const taxTypeOptions = [
  { value: 'npwp', label: 'NPWP (Nomor Pokok Wajib Pajak)' },
  { value: 'pkp', label: 'PKP (Pengusaha Kena Pajak)' },
  { value: 'others', label: 'Lainnya' },
]

// Owner type options (Opsional jika frontend perlu tampilkan, backend sudah handle lewat token)
const ownerTypeOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
]

// Import composable
const {
  taxIdentifications,
  loading: isLoading,
  primaryTax,
  fetchTaxIdentifications,
  createTaxIdentification,
  updateTaxIdentification,
  deleteTaxIdentification,
  setPrimary,
  toggleActive,
} = useTaxIdentifications()

// Modal dan form state
const showForm = ref(false)
const editingTax = ref<any | null>(null)

const formData = ref({
  taxType: 'npwp',
  taxNumber: '',
  taxName: '',
  registeredAddress: '',
  isActive: true,
  isPrimary: false,
})

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: () => {},
})

const openConfirm = (title: string, message: string, onConfirm: () => void) => {
  confirmDialog.value = {
    show: true,
    title,
    message,
    onConfirm,
  }
}

const closeConfirm = () => {
  confirmDialog.value.show = false
}


// Open Form
const openForm = (tax?: any) => {
  if (tax) {
    editingTax.value = tax
    formData.value = {
      taxType: tax.taxType,
      taxNumber: tax.taxNumber,
      taxName: tax.taxName,
      registeredAddress: tax.registeredAddress,
      isActive: tax.isActive,
      isPrimary: tax.isPrimary,
    }
  } else {
    editingTax.value = null
    resetForm()
  }
  showForm.value = true
}

// Reset form
const resetForm = () => {
  formData.value = {
    taxType: 'npwp',
    taxNumber: '',
    taxName: '',
    registeredAddress: '',
    isActive: true,
    isPrimary: false
  }
}

// Close form
const closeForm = () => {
  showForm.value = false
  editingTax.value = null
  resetForm()
}

// Save (Create / Update)
const saveTaxIdentification = async () => {
  const payload = { ...formData.value }
  try {
    if (editingTax.value) {
      await updateTaxIdentification(editingTax.value.id, payload)
    } else {
      await createTaxIdentification(payload)
    }
    closeForm()
  } catch (error) {
    console.error('Error saving tax identification:', error)
  }
}

const handleDelete = (id: number) => {
  openConfirm('Hapus Data Pajak', 'Apakah Anda yakin ingin menghapus data ini?', async () => {
    try {
      await deleteTaxIdentification(id)
      toast.success('Data pajak berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus data pajak')
    } finally {
      closeConfirm()
    }
  })
}

const handleSetPrimary = (id: number) => {
  openConfirm('Jadikan Utama', 'Apakah Anda yakin ingin menjadikan ini sebagai pajak utama?', async () => {
    try {
      await setPrimary(id)
      toast.success('Berhasil menjadikan pajak utama')
    } catch {
      toast.error('Gagal menjadikan pajak utama')
    } finally {
      closeConfirm()
    }
  })
}

const handleToggleActive = (tax: any) => {
  const status = tax.isActive ? 'Nonaktifkan' : 'Aktifkan'
  openConfirm(`${status} Data Pajak`, `Apakah Anda yakin ingin ${status.toLowerCase()} data pajak ini?`, async () => {
    try {
      await toggleActive(tax)
      toast.success(`Data pajak berhasil di${status.toLowerCase()}`)
    } catch {
      toast.error(`Gagal ${status.toLowerCase()} data pajak`)
    } finally {
      closeConfirm()
    }
  })
}


// On mounted fetch data
onMounted(() => {
  fetchTaxIdentifications()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Data Pajak</h1>
        <p class="text-gray-600">Kelola informasi identitas pajak perusahaan</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>

    <!-- Tax Identifications List -->
    <div v-else class="grid gap-4">
      <div
        v-for="tax in taxIdentifications"
        :key="tax.id"
        class="bg-white border rounded-lg p-6 shadow-sm"
        :class="{
          'ring-2 ring-green-500 border-green-500': tax.isPrimary,
          'opacity-50': !tax.isActive
        }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-semibold text-lg">{{ tax.taxName }}</span>
              <span
                v-if="tax.isPrimary"
                class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
              >
                Utama
              </span>
              <span
                :class="{
                  'bg-green-100 text-green-800': tax.isActive,
                  'bg-gray-100 text-gray-800': !tax.isActive
                }"
                class="text-xs px-2 py-1 rounded-full"
              >
                {{ tax.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
            
            <div class="space-y-1 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span class="font-medium">Jenis:</span>
                <span class="capitalize">{{ taxTypeOptions.find(opt => opt.value === tax.taxType)?.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">Nomor:</span>
                <span class="font-mono">{{ tax.taxNumber }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">Tipe:</span>
                <span class="capitalize">{{ tax.ownerType }}</span>
              </div>
              <div v-if="tax.registeredAddress" class="flex items-start gap-2">
                <span class="font-medium">Alamat:</span>
                <span>{{ tax.registeredAddress }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2 ml-4">
            <!-- Jadikan Utama -->
            <button
              v-if="!tax.isPrimary"
              @click="handleSetPrimary(tax.id)"
              class="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
            >
              Jadikan Utama
            </button>

            <!-- Edit -->
            <button
              @click="openForm(tax)"
              class="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
            >
              Edit
            </button>

            <!-- Hapus -->
            <button
              @click="handleDelete(tax.id)"
              class="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded hover:bg-red-50"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="taxIdentifications.length === 0" class="text-center py-8 text-gray-500">
        Belum ada data pajak. Klik "Tambah Data Pajak" untuk menambahkan data pertama.
      </div>
    </div>

    <!-- Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-4">
            {{ editingTax ? 'Edit Data Pajak' : 'Tambah Data Pajak' }}
          </h2>
          
          <form @submit.prevent="saveTaxIdentification" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Jenis Pajak
              </label>
              <select
                v-model="formData.taxType"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option v-for="option in taxTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nomor Pajak
              </label>
              <input
                v-model="formData.taxNumber"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nomor pajak"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nama Pajak
              </label>
              <input
                v-model="formData.taxName"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nama pajak"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Alamat Terdaftar
              </label>
              <textarea
                v-model="formData.registeredAddress"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan alamat terdaftar (opsional)"
              ></textarea>
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm text-gray-700">Aktif</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="formData.isPrimary"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm text-gray-700">Jadikan Utama</span>
              </label>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              >
                {{ editingTax ? 'Update' : 'Simpan' }}
              </button>
              <button
                type="button"
                @click="closeForm"
                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div
    v-if="confirmDialog.show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
    <div class="bg-white rounded-lg max-w-sm w-full p-6">
        <h3 class="text-lg font-semibold mb-2">{{ confirmDialog.title }}</h3>
        <p class="text-sm text-gray-600 mb-4">{{ confirmDialog.message }}</p>
        <div class="flex gap-2 justify-end">
        <button
            @click="closeConfirm"
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
            Batal
        </button>
        <button
            @click="confirmDialog.onConfirm"
            class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
        >
            Ya, Lanjutkan
        </button>
        </div>
    </div>
    </div>

  </div>
</template>
