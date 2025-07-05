<!-- components/stepper/DeliveryStep.vue -->
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useShipping } from '@/composables/useShipping'
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Truck, 
  Loader2,
  AlertCircle,
  Package,
  Timer,
  DollarSign
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

// Props & Emits
interface Props {
  formData: any
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous'])

// Composable
const { checkShippingCost, loading: shippingLoading, getAvailableCouriers, formatCourierString } = useShipping()

// Local state
const shippingOptions = ref([])
const selectedShippingId = ref(props.formData.selectedShippingId || null)
const selectedShippingOption = ref(props.formData.selectedShippingOption || null)
const fetchingOptions = ref(false)

// Computed
const isFormValid = computed(() => {
  return selectedShippingId.value !== null && selectedShippingOption.value !== null
})

const selectedOption = computed(() => {
  return shippingOptions.value.find(option => option.id === selectedShippingId.value)
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format delivery time
const formatDeliveryTime = (etd: string) => {
  if (!etd) return 'Estimasi tidak tersedia'
  
  // Handle different ETD formats
  if (etd.includes('-')) {
    const [min, max] = etd.split('-')
    return `${min.trim()}-${max.trim()} hari`
  }
  
  return `${etd} hari`
}

// Get shipping service icon
const getServiceIcon = (service: string) => {
  const lowerService = service.toLowerCase()
  if (lowerService.includes('regular') || lowerService.includes('ekonomi')) {
    return Package
  } else if (lowerService.includes('express') || lowerService.includes('kilat')) {
    return Timer
  } else if (lowerService.includes('same day') || lowerService.includes('instant')) {
    return Clock
  }
  return Truck
}

// Get service color scheme
const getServiceColor = (service: string) => {
  const lowerService = service.toLowerCase()
  if (lowerService.includes('regular') || lowerService.includes('ekonomi')) {
    return 'bg-blue-100 text-blue-700 border-blue-200'
  } else if (lowerService.includes('express') || lowerService.includes('kilat')) {
    return 'bg-orange-100 text-orange-700 border-orange-200'
  } else if (lowerService.includes('same day') || lowerService.includes('instant')) {
    return 'bg-red-100 text-red-700 border-red-200'
  }
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

// Fetch shipping options
const fetchShippingOptions = async () => {
  // Default values
  const defaultWeight = 1000 // 1kg in grams (sesuai dengan curl example)
  const defaultOriginId = 19031 // Sesuai dengan curl example
  
  const originId = props.formData.originId || defaultOriginId
  const weight = props.formData.weight || defaultWeight
  
  if (!props.formData.destinationId) {
    toast.error('Data tujuan pengiriman belum lengkap')
    return
  }

  fetchingOptions.value = true
  
  try {
    // Get available couriers and format as string
    const availableCouriers = getAvailableCouriers()
    const courierString = formatCourierString(availableCouriers.map(c => c.code))
    
    console.log('📦 Fetching shipping with payload:', {
      origin: originId.toString(),
      destination: props.formData.destinationId.toString(),
      weight: weight,
      courier: courierString,
      price: 'lowest'
    })

    const result = await checkShippingCost({
      origin: originId.toString(),
      destination: props.formData.destinationId.toString(),
      weight: weight,
      courier: courierString, // PENTING: Parameter courier yang hilang
      price: 'lowest'
    })

    console.log('📦 Shipping cost result:', result)

    if (result && result.length > 0) {
      // Transform the result to match expected format
      const options = result.map((item, index) => ({
        id: `${item.code}-${item.service}-${index}`,
        courierCode: item.code,
        courierName: item.name,
        service: item.service,
        description: item.description,
        cost: item.cost,
        etd: item.etd,
        note: item.note || ''
      }))

      shippingOptions.value = options.sort((a, b) => a.cost - b.cost) // Sort by price
      
      console.log('✅ Shipping options loaded:', options)
      toast.success(`${options.length} opsi pengiriman tersedia`)

      // Auto-select cheapest option if none selected
      if (!selectedShippingId.value && options.length > 0) {
        selectShippingOption(options[0].id)
      }
    } else {
      shippingOptions.value = []
      toast.warning('Tidak ada opsi pengiriman tersedia')
    }
  } catch (error) {
    console.error('❌ Failed to fetch shipping options:', error)
    toast.error(error.message || 'Gagal mengambil opsi pengiriman')
    shippingOptions.value = []
  } finally {
    fetchingOptions.value = false
  }
}

// Handle shipping option selection
const selectShippingOption = (optionId: string) => {
  selectedShippingId.value = optionId
  selectedShippingOption.value = shippingOptions.value.find(opt => opt.id === optionId)
  
  if (selectedShippingOption.value) {
    console.log('✅ Selected shipping option:', selectedShippingOption.value)
  }
}

// Handle next step
const handleNext = () => {
  if (!isFormValid.value) {
    toast.error('Harap pilih metode pengiriman')
    return
  }

  // Update parent form data
  emit('update', {
    selectedShippingId: selectedShippingId.value,
    selectedShippingOption: selectedShippingOption.value,
    shippingCost: selectedShippingOption.value?.cost || 0,
    estimatedDelivery: selectedShippingOption.value?.etd || '',
    courierName: selectedShippingOption.value?.courierName || '',
    serviceName: selectedShippingOption.value?.service || '',
    // Include default values if not present
    weight: props.formData.weight || 1000,
    originId: props.formData.originId || 19031
  })

  // Proceed to next step
  emit('next', props.currentStep + 1)
}

// Handle previous step
const handlePrevious = () => {
  emit('previous')
}

// Watch for formData changes
watch(() => [props.formData.destinationId, props.formData.originId, props.formData.weight], 
  ([destinationId, originId, weight]) => {
    if (destinationId) {
      console.log('📦 Form data changed, refetching shipping options:', {
        destinationId,
        originId: originId || 19031,
        weight: weight || 1000
      })
      fetchShippingOptions()
    }
  }, 
  { deep: true, immediate: true }
)

// Initialize
onMounted(() => {
  console.log('📦 DeliveryStep mounted with formData:', props.formData)
  if (props.formData.destinationId) {
    fetchShippingOptions()
  }
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Truck class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Pilih Metode Pengiriman</h3>
          <p class="text-sm text-gray-500">Pilih kurir dan layanan pengiriman yang sesuai</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">Berat Paket</p>
        <p class="font-medium text-gray-900">{{ ((props.formData.weight || 1000) / 1000).toFixed(1) }} kg</p>
      </div>
    </div>

    <!-- Debug Info (remove in production) -->
    <div class="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
      <p><strong>Debug Info:</strong></p>
      <p>Origin ID: {{ props.formData.originId || 19031 }}</p>
      <p>Destination ID: {{ props.formData.destinationId || 'Not set' }}</p>
      <p>Weight: {{ props.formData.weight || 1000 }}g</p>
      <p>Available Couriers: {{ formatCourierString(getAvailableCouriers().map(c => c.code)) }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="fetchingOptions || shippingLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-sm text-gray-500">Mencari opsi pengiriman...</p>
      </div>
    </div>

    <!-- Shipping Options -->
    <div v-else-if="shippingOptions.length > 0">
      <RadioGroup 
        :model-value="selectedShippingId" 
        @update:model-value="selectShippingOption"
        class="space-y-4"
      >
        <div
          v-for="option in shippingOptions"
          :key="option.id"
          class="relative"
        >
          <div class="flex items-start gap-3">
            <RadioGroupItem 
              :value="option.id" 
              :id="`shipping-${option.id}`"
              class="mt-4"
            />
            <Label 
              :for="`shipping-${option.id}`" 
              class="flex-1 cursor-pointer"
            >
              <Card 
                class="transition-all duration-200 hover:shadow-md"
                :class="{
                  'border-blue-500 bg-blue-50': selectedShippingId === option.id,
                  'border-gray-200 hover:border-gray-300': selectedShippingId !== option.id
                }"
              >
                <CardContent class="p-4">
                  <!-- Option Header -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <component 
                          :is="getServiceIcon(option.service)"
                          class="w-6 h-6 text-gray-600"
                        />
                      </div>
                      <div>
                        <h4 class="font-semibold text-gray-900">{{ option.courierName }}</h4>
                        <p class="text-sm text-gray-600">{{ option.service }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-bold text-gray-900">{{ formatCurrency(option.cost) }}</p>
                      <Badge 
                        variant="outline"
                        :class="getServiceColor(option.service)"
                        class="text-xs mt-1"
                      >
                        {{ option.service }}
                      </Badge>
                    </div>
                  </div>

                  <!-- Service Details -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Clock class="w-4 h-4" />
                      <span>Estimasi: {{ formatDeliveryTime(option.etd) }}</span>
                    </div>
                    
                    <div v-if="option.description" class="text-sm text-gray-600">
                      <p>{{ option.description }}</p>
                    </div>
                    
                    <div v-if="option.note" class="text-xs text-gray-500 italic">
                      {{ option.note }}
                    </div>
                  </div>

                  <!-- Selection Indicator -->
                  <div 
                    v-if="selectedShippingId === option.id"
                    class="absolute top-4 right-4"
                  >
                    <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check class="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        </div>
      </RadioGroup>

      <!-- Selected Option Summary -->
      <div v-if="selectedShippingOption" class="mt-6">
        <Card class="bg-blue-50 border-blue-200">
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Truck class="w-4 h-4" />
              Metode Pengiriman Terpilih
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="flex items-center justify-between">
              <div class="text-sm text-blue-700">
                <p class="font-medium">{{ selectedShippingOption.courierName }} - {{ selectedShippingOption.service }}</p>
                <p>Estimasi pengiriman: {{ formatDeliveryTime(selectedShippingOption.etd) }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-blue-900">{{ formatCurrency(selectedShippingOption.cost) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Truck class="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Tidak Ada Opsi Pengiriman</h4>
          <p class="text-gray-500 mb-4">
            Tidak ada layanan pengiriman tersedia untuk tujuan ini
          </p>
          <Button 
            variant="outline" 
            @click="fetchShippingOptions"
            :disabled="fetchingOptions"
            class="flex items-center gap-2"
          >
            <Loader2 v-if="fetchingOptions" class="w-4 h-4 animate-spin" />
            <span>{{ fetchingOptions ? 'Mencari...' : 'Coba Lagi' }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Missing Data Alert -->
    <div v-if="!props.formData.destinationId" class="mt-4">
      <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle class="w-4 h-4 text-amber-600" />
        <p class="text-sm text-amber-700">
          Alamat tujuan belum dipilih. Silakan kembali ke langkah sebelumnya untuk memilih alamat.
        </p>
      </div>
    </div>

    <!-- Form Validation Alert -->
    <div v-if="!isFormValid && shippingOptions.length > 0 && !fetchingOptions" class="mt-4">
      <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle class="w-4 h-4 text-amber-600" />
        <p class="text-sm text-amber-700">
          Harap pilih metode pengiriman sebelum melanjutkan
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
          :disabled="!isFormValid || fetchingOptions || shippingLoading"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 v-if="fetchingOptions || shippingLoading" class="w-4 h-4 animate-spin" />
          <span>{{ (fetchingOptions || shippingLoading) ? 'Memproses...' : 'Lanjutkan' }}</span>
          <ChevronRight v-if="!fetchingOptions && !shippingLoading" class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes pulse-blue {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}

.animate-pulse-blue {
  animation: pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Radio button custom styling */
.radio-group-item:checked + .card {
  @apply border-blue-500 bg-blue-50;
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
