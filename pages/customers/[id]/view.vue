
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomers } from '~/composables/useCustomers'

// Meta
definePageMeta({
  title: 'Detail Pengembang',
  layout: 'default'
})

// Composables
const route = useRoute()
const router = useRouter()
const { getCustomer } = useCustomers()

// Reactive data
const developer = ref(null)
const loading = ref(false)
const error = ref('')

// Get developer ID from route
const developerId = computed(() => Number(route.params.id))
// Methods
const fetchDeveloperDetail = async () => {
  if (!developerId.value) {
    error.value = 'ID pengembang tidak valid'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await getCustomer(developerId.value)
    developer.value = response
    console.log(developer.value)
  }
  catch (err) {
    console.error('Error fetching developer:', err)
    error.value = 'Gagal memuat data pengembang'
  }
  finally {
    loading.value = false
  }
}

const editDeveloper = () => {
  router.push(`/developers/${developerId.value}/edit`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  fetchDeveloperDetail()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    fetchDeveloperDetail()
  }
})
</script>

<template>
  <div class="mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="text-red-500 text-xl mb-4">❌ Terjadi Kesalahan</div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="fetchDeveloperDetail" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="developer" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            @click="$router.back()" 
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ developer.name }}</h1>
            <p class="text-gray-500">Detail Pengembang</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="editDeveloper" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Edit</span>
          </button>
        </div>
      </div>

      <!-- Cards Container -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Information Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Informasi Pribadi</h2>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Nama Lengkap</label>
                <p class="text-gray-900 font-medium">{{ developer.name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Email</label>
                <p class="text-gray-900">{{ developer.email }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Nomor Telepon</label>
                <p class="text-gray-900">{{ developer.phone }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">NPWP</label>
                <p class="text-gray-900 font-mono">{{ developer.npwp }}</p>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Alamat</label>
              <p class="text-gray-900">{{ developer.address }}</p>
              <p class="text-gray-600 text-sm">
                {{ developer.city }}, {{ developer.province }} {{ developer.postalcode }}
              </p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Tanggal Bergabung</label>
              <p class="text-gray-900">{{ formatDate(developer.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Tax Information Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">Informasi Pajak</h2>
            </div>
            <span class="text-sm text-gray-500">{{ developer.tax?.length || 0 }} Data</span>
          </div>
          
          <div class="space-y-4">
            <div v-if="developer.tax && developer.tax.length > 0">
              <div 
                v-for="tax in developer.tax" 
                :key="tax.id"
                class="border border-gray-200 rounded-lg p-4 relative"
                :class="{ 'border-green-500 bg-green-50': tax.isPrimary }"
              >
                <div v-if="tax.isPrimary" class="absolute top-2 right-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Primary
                  </span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Jenis Pajak</label>
                    <p class="text-gray-900 uppercase">{{ tax.taxType }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Nomor Pajak</label>
                    <p class="text-gray-900 font-mono">{{ tax.taxNumber }}</p>
                  </div>
                </div>
                
                <div class="mt-3">
                  <label class="text-sm font-medium text-gray-500">Nama Terdaftar</label>
                  <p class="text-gray-900">{{ tax.taxName }}</p>
                </div>
                
                <div class="mt-3">
                  <label class="text-sm font-medium text-gray-500">Alamat Terdaftar</label>
                  <p class="text-gray-900">{{ tax.registeredAddress }}</p>
                </div>
                
                <div class="mt-3 flex justify-between items-center">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="tax.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ tax.isActive ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                  <span class="text-xs text-gray-500">{{ formatDate(tax.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p>Belum ada data pajak</p>
            </div>
          </div>
        </div>

        <!-- Bank Information Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">Informasi Bank</h2>
            </div>
            <span class="text-sm text-gray-500">{{ developer.bank?.length || 0 }} Rekening</span>
          </div>
          
          <div class="space-y-4">
            <div v-if="developer.bank && developer.bank.length > 0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="bank in developer.bank" 
                  :key="bank.id"
                  class="border border-gray-200 rounded-lg p-4 relative"
                  :class="{ 'border-purple-500 bg-purple-50': bank.isPrimary }"
                >
                  <div v-if="bank.isPrimary" class="absolute top-2 right-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Primary
                    </span>
                  </div>
                  
                  <div class="space-y-3">
                    <div>
                      <label class="text-sm font-medium text-gray-500">Nama Bank</label>
                      <p class="text-gray-900 font-semibold">{{ bank.bankName }}</p>
                    </div>
                    
                    <div>
                      <label class="text-sm font-medium text-gray-500">Nomor Rekening</label>
                      <p class="text-gray-900 font-mono text-lg">{{ bank.accountNumber }}</p>
                    </div>
                    
                    <div>
                      <label class="text-sm font-medium text-gray-500">Nama Pemegang</label>
                      <p class="text-gray-900">{{ bank.accountName }}</p>
                    </div>
                    
                    <div>
                      <label class="text-sm font-medium text-gray-500">Cabang</label>
                      <p class="text-gray-900">{{ bank.branch }}</p>
                    </div>
                    
                    <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span class="text-xs text-gray-500">{{ formatDate(bank.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <p>Belum ada data bank</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="text-gray-400 text-6xl mb-4">👤</div>
        <p class="text-gray-600">Data pengembang tidak ditemukan</p>
      </div>
    </div>
  </div>
</template>
