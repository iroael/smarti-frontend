<!-- components/stepper/AddressStep.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Building, 
  Truck,
  Phone,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAddress } from '@/composables/useAddress'
import { useShipping } from '@/composables/useShipping'

// Props & Emits
interface Props {
  formData: any
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous'])

// Composables
const { 
  addresses,
  loading,
  defaultAddress,
  fetchUserAddresses,
  isAuthenticated,
} = useAddress()

const {
  searchDestinationByAddress,
  getOriginId,
  searchLoading,
} = useShipping()

// Local state
const selectedAddressId = ref(props.formData.selectedAddressId || null)
const destinationId = ref(props.formData.destinationId || null)
const originId = ref(props.formData.originId || null)
const processingDestination = ref(false)

// Your origin/warehouse address - replace with your actual data
const originAddress = {
  city: 'Jakarta Selatan',
  province: 'DKI Jakarta',
  subdistrict: 'Kebayoran Baru',
  district: 'Kebayoran Baru',
  postal_code: '12190'
}

// Computed
const selectedAddress = computed(() => {
  return addresses.value.find(addr => addr.id === selectedAddressId.value)
})

const isFormValid = computed(() => {
  return selectedAddressId.value !== null && destinationId.value !== null && selectedAddress.value
})

// Watch for changes and emit updates immediately
watch([selectedAddressId, destinationId, selectedAddress], () => {
  if (selectedAddressId.value && destinationId.value && selectedAddress.value) {
    emitFormUpdate()
  }
}, { deep: true })

// Emit form update to parent
const emitFormUpdate = () => {
  const updateData = {
    selectedAddressId: selectedAddressId.value,
    selectedAddress: selectedAddress.value,
    destinationId: destinationId.value,
    originId: originId.value,
    weight: props.formData.weight || 1000,
    // Additional shipping info for the order summary
    shippingAddress: {
      id: selectedAddressId.value,
      name: selectedAddress.value?.recipient_name || selectedAddress.value?.name,
      phone: selectedAddress.value?.phone,
      address: selectedAddress.value?.street_address || selectedAddress.value?.address,
      city: selectedAddress.value?.city,
      province: selectedAddress.value?.province,
      postal_code: selectedAddress.value?.postal_code || selectedAddress.value?.postalCode,
      full_address: `${selectedAddress.value?.street_address || selectedAddress.value?.address}, ${selectedAddress.value?.city}, ${selectedAddress.value?.province} ${selectedAddress.value?.postal_code || selectedAddress.value?.postalCode}`
    }
  }
  
  console.log('🔄 Emitting address update:', updateData)
  emit('update', updateData)
}

// Get address type icon
const getAddressTypeIcon = (type: string) => {
  switch (type) {
    case 'office': return Building
    case 'warehouse': return Truck
    default: return Home
  }
}

// Get address type color
const getAddressTypeColor = (type: string) => {
  switch (type) {
    case 'office': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'warehouse': return 'bg-orange-100 text-orange-700 border-orange-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Fetch customer addresses from API
const fetchCustomerAddresses = async () => {
  try {
    if (!isAuthenticated.value) {
      toast.error('Anda belum login')
      return
    }

    await fetchUserAddresses()

    // Set default address if none selected
    if (!selectedAddressId.value && addresses.value.length > 0) {
      // Try to use default address first
      if (defaultAddress.value) {
        selectedAddressId.value = defaultAddress.value.id
        await handleAddressSelection(defaultAddress.value)
      } else {
        // Otherwise use first address
        selectedAddressId.value = addresses.value[0].id
        await handleAddressSelection(addresses.value[0])
      }
    }
    
    console.log('✅ Addresses loaded:', addresses.value)
  } catch (error) {
    console.error('❌ Failed to fetch addresses:', error)
    toast.error('Gagal mengambil data alamat')
  }
}

// Get origin ID on component mount
const initializeOriginId = async () => {
  try {
    if (!originId.value) {
      const id = await getOriginId(originAddress)
      if (id) {
        originId.value = id
        console.log('✅ Origin ID:', id)
      } else {
        console.warn('⚠️ Origin ID not found')
        toast.warning('Lokasi asal tidak ditemukan')
      }
    }
  } catch (error) {
    console.error('❌ Failed to get origin ID:', error)
  }
}

// Handle address selection and auto-search destination
const handleAddressSelection = async (address: any) => {
  processingDestination.value = true
  try {
    console.log('🔍 Searching destination for address:', address)
    
    // Search for destination ID based on selected address
    const destination = await searchDestinationByAddress({
      city: address.city,
      province: address.province,
      subdistrict: address.subdistrict_name || address.subdistrict,
      district: address.district_name || address.district,
      postal_code: address.postal_code || address.postalCode,
      zip_code: address.zip_code || address.postal_code || address.postalCode
    })

    if (destination) {
      destinationId.value = destination.id
      console.log('✅ Destination found:', destination)
      toast.success(`Tujuan pengiriman: ${destination.label}`)
      
      // Immediately emit update after destination is found
      setTimeout(() => {
        emitFormUpdate()
      }, 100)
    } else {
      destinationId.value = null
      console.warn('⚠️ Destination not found for address:', address)
      toast.warning('Lokasi tujuan tidak ditemukan, silakan hubungi customer service')
    }
  } catch (error) {
    console.error('❌ Failed to search destination:', error)
    destinationId.value = null
    toast.error('Gagal mencari lokasi tujuan')
  } finally {
    processingDestination.value = false
  }
}

// Handle address selection
const selectAddress = async (addressId: number) => {
  console.log('🎯 Address selected:', addressId)
  selectedAddressId.value = addressId
  const address = addresses.value.find(addr => addr.id === addressId)
  
  if (address) {
    await handleAddressSelection(address)
    console.log('📍 Selected address details:', address)
  }
}

// Handle next step
const handleNext = () => {
  if (!isFormValid.value) {
    if (!selectedAddressId.value) {
      toast.error('Harap pilih alamat pengiriman')
    } else if (!destinationId.value) {
      toast.error('Lokasi tujuan belum ditemukan')
    } else if (!selectedAddress.value) {
      toast.error('Data alamat tidak lengkap')
    }
    return
  }

  // Final update before proceeding
  emitFormUpdate()
  
  console.log('➡️ Proceeding to next step with data:', {
    selectedAddressId: selectedAddressId.value,
    selectedAddress: selectedAddress.value,
    destinationId: destinationId.value,
    originId: originId.value
  })

  // Proceed to next step
  emit('next', 2)
}

// Handle previous step
const handlePrevious = () => {
  emit('previous')
}

// Initialize
onMounted(async () => {
  console.log('🚀 AddressStep mounted with formData:', props.formData)
  
  await Promise.all([
    fetchCustomerAddresses(),
    initializeOriginId()
  ])
  // If we already have address data from formData, emit it
  if (props.formData.selectedAddress && props.formData.destinationId) {
    setTimeout(() => {
      emitFormUpdate()
    }, 500)
  }
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <MapPin class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Pilih Alamat Pengiriman</h3>
          <p class="text-sm text-gray-500">Tentukan alamat tujuan pengiriman untuk order ini</p>
        </div>
      </div>
    </div>

    <!-- Debug Info (remove in production) -->
    <div class="mb-4 p-3 bg-gray-100 rounded text-xs">
      <p><strong>Debug:</strong></p>
      <p>Selected ID: {{ selectedAddressId }}</p>
      <p>Destination ID: {{ destinationId }}</p>
      <p>Form Valid: {{ isFormValid }}</p>
      <p>Selected Address: {{ selectedAddress?.name || 'None' }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p class="text-sm text-gray-500">Memuat alamat...</p>
      </div>
    </div>

    <!-- Address Selection -->
    <div v-else-if="addresses.length > 0">
      <RadioGroup 
        :model-value="selectedAddressId" 
        @update:model-value="selectAddress"
        class="space-y-4"
      >
        <div
          v-for="address in addresses"
          :key="address.id"
          class="relative"
        >
          <div class="flex items-start gap-3">
            <RadioGroupItem 
              :value="address.id" 
              :id="`address-${address.id}`"
              class="mt-4"
              :disabled="processingDestination && selectedAddressId === address.id"
            />
            <Label 
              :for="`address-${address.id}`" 
              class="flex-1 cursor-pointer"
            >
              <Card 
                class="transition-all duration-200 hover:shadow-md"
                :class="{
                  'border-green-500 bg-green-50': selectedAddressId === address.id,
                  'border-gray-200 hover:border-gray-300': selectedAddressId !== address.id,
                  'opacity-70': processingDestination && selectedAddressId === address.id
                }"
              >
                <CardContent class="p-4">
                  <!-- Processing Indicator -->
                  <div 
                    v-if="processingDestination && selectedAddressId === address.id"
                    class="absolute top-4 right-4"
                  >
                    <Loader2 class="w-4 h-4 animate-spin text-green-600" />
                  </div>

                  <!-- Address Header -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <component 
                        :is="getAddressTypeIcon(address.type || 'home')"
                        class="w-4 h-4 text-gray-600"
                      />
                      <h4 class="font-medium text-gray-900">
                        {{ address.label || address.name || 'Alamat' }}
                      </h4>
                      <Badge 
                        v-if="address.is_default"
                        variant="secondary"
                        class="bg-green-100 text-green-700 border-green-200"
                      >
                        Default
                      </Badge>
                    </div>
                    <Badge 
                      variant="outline"
                      :class="getAddressTypeColor(address.type || 'home')"
                      class="text-xs"
                    >
                      {{ (address.type || 'home').charAt(0).toUpperCase() + (address.type || 'home').slice(1) }}
                    </Badge>
                  </div>

                  <!-- Contact Info -->
                  <div class="space-y-2 mb-3">
                    <p class="font-medium text-gray-900">{{ address.recipient_name || address.name }}</p>
                    <div v-if="address.phone" class="flex items-center gap-2 text-sm text-gray-600">
                      <Phone class="w-3 h-3" />
                      <span>{{ address.phone }}</span>
                    </div>
                  </div>

                  <!-- Address Details -->
                  <div class="text-sm text-gray-700 space-y-1">
                    <p>{{ address.street_address || address.address }}</p>
                    <p>
                      {{ address.city }}{{ address.province ? `, ${address.province}` : '' }}
                      {{ address.postal_code || address.postalCode }}
                    </p>
                  </div>

                  <!-- Destination Status -->
                  <div 
                    v-if="selectedAddressId === address.id"
                    class="mt-3 pt-3 border-t border-gray-200"
                  >
                    <div class="flex items-center gap-2 text-xs">
                      <div 
                        v-if="processingDestination"
                        class="flex items-center gap-2 text-orange-600"
                      >
                        <Loader2 class="w-3 h-3 animate-spin" />
                        <span>Mencari lokasi tujuan...</span>
                      </div>
                      <div 
                        v-else-if="destinationId"
                        class="flex items-center gap-2 text-green-600"
                      >
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Lokasi tujuan ditemukan</span>
                      </div>
                      <div 
                        v-else
                        class="flex items-center gap-2 text-red-600"
                      >
                        <AlertCircle class="w-3 h-3" />
                        <span>Lokasi tujuan tidak ditemukan</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        </div>
      </RadioGroup>

      <!-- Selected Address Summary -->
      <div v-if="selectedAddress && destinationId" class="mt-6">
        <Card class="bg-green-50 border-green-200">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-green-800 flex items-center gap-2">
              <MapPin class="w-4 h-4" />
              Alamat Pengiriman Terpilih
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="text-sm text-green-700">
              <p class="font-medium">{{ selectedAddress.recipient_name || selectedAddress.name }}</p>
              <p>{{ selectedAddress.street_address || selectedAddress.address }}</p>
              <p>
                {{ selectedAddress.city }}{{ selectedAddress.province ? `, ${selectedAddress.province}` : '' }}
                {{ selectedAddress.postal_code || selectedAddress.postalCode }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <MapPin class="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Alamat</h4>
          <p class="text-gray-500 mb-4">Anda belum memiliki alamat tersimpan</p>
          <Button variant="outline" class="flex items-center gap-2">
            <Plus class="w-4 h-4" />
            Tambah Alamat Baru
          </Button>
        </div>
      </div>
    </div>

    <!-- Authentication Error -->
    <div v-if="!isAuthenticated && !loading" class="text-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle class="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Belum Login</h4>
          <p class="text-gray-500 mb-4">Anda perlu login untuk melihat alamat tersimpan</p>
        </div>
      </div>
    </div>

    <!-- Form Validation Alert -->
    <div v-if="!isFormValid && !loading && addresses.length > 0" class="mt-4">
      <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle class="w-4 h-4 text-amber-600" />
        <p class="text-sm text-amber-700">
          <span v-if="!selectedAddressId">Harap pilih alamat pengiriman sebelum melanjutkan</span>
          <span v-else-if="!destinationId">Lokasi tujuan pengiriman belum ditemukan</span>
          <span v-else-if="!selectedAddress">Data alamat tidak lengkap</span>
        </p>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <Button 
        variant="outline" 
        @click="handlePrevious"
        class="flex items-center gap-2"
      >
        <ChevronLeft class="w-4 h-4" />
        Kembali
      </Button>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Step {{ currentStep }} of 5</span>
        <Button 
          @click="handleNext"
          :disabled="!isFormValid || loading || processingDestination"
          class="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 v-if="processingDestination" class="w-4 h-4 animate-spin" />
          <span>{{ processingDestination ? 'Memproses...' : 'Lanjutkan' }}</span>
          <ChevronRight v-if="!processingDestination" class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes pulse-green {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}

.animate-pulse-green {
  animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Radio button custom styling */
.radio-group-item:checked + .card {
  @apply border-green-500 bg-green-50;
}

/* Smooth transitions */
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
}

/* Loading spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>