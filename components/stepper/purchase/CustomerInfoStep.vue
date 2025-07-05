<!-- components/stepper/CustomerInfoStep.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Phone, Mail, Building, ChevronRight, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '~/stores/auth'

// Props & Emits
interface Props {
  formData: any
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous'])

// Composables
const authStore = useAuthStore()

// Local state
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// Form fields
const customerName = ref(props.formData.customerName || '')
const customerId = ref(props.formData.customerId || null)
const customerEmail = ref(props.formData.customerEmail || '')
const customerPhone = ref(props.formData.customerPhone || '')
const notes = ref(props.formData.notes || '')

// Computed
const isFormValid = computed(() => {
  return customerName.value.trim() && customerId.value && customerPhone.value.trim()
})

// Validation
const validate = () => {
  errors.value = {}
  if (!customerName.value.trim()) {
    errors.value.customerName = 'Nama customer wajib diisi'
  }
  if (!customerId.value) {
    errors.value.customerId = 'Customer ID tidak ditemukan'
  }
  if (!customerPhone.value.trim()) {
    errors.value.customerPhone = 'Nomor telepon wajib diisi'
  }
  else if (!/^[0-9+\-\s]+$/.test(customerPhone.value)) {
    errors.value.customerPhone = 'Format nomor telepon tidak valid'
  }
  if (customerEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.value)) {
    errors.value.customerEmail = 'Format email tidak valid'
  }

  return Object.keys(errors.value).length === 0
}

// Fetch current customer data
const fetchCurrentCustomer = async () => {
  loading.value = true
  try {
    await authStore.fetchProfile()
    const user = authStore.user
    const customerData = user?.profile || user

    customerName.value = customerData?.name || ''
    customerId.value = customerData?.id || null
    customerEmail.value = customerData?.email || ''
    customerPhone.value = customerData?.phone || ''

    console.log('✅ Customer data loaded:', customerData)
  } catch (error) {
    console.error('❌ Failed to fetch customer:', error)
    toast.error('Gagal mengambil data customer')
  } finally {
    loading.value = false
  }
}

// Handle next step
const handleNext = () => {
  if (!validate()) {
    toast.error('Harap perbaiki kesalahan pada form')
    return
  }

  // Update parent form data
  emit('update', {
    customerInfo: {
      customerId: customerId.value,
      customerName: customerName.value,
      customerPhone: customerPhone.value,
      customerEmail: customerEmail.value,
    //   company: company.value, // opsional
    },
    notes: notes.value,
  })

  // Proceed to next step
  emit('next', 1)
}

// Watch for changes to clear errors
watch([customerName, customerPhone, customerEmail], () => {
  if (errors.value.customerName) delete errors.value.customerName
  if (errors.value.customerPhone) delete errors.value.customerPhone
  if (errors.value.customerEmail) delete errors.value.customerEmail
})

// Initialize
onMounted(() => {
  fetchCurrentCustomer()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Informasi Customer</h3>
          <p class="text-sm text-gray-500">Masukkan atau verifikasi data customer untuk order ini</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Memuat data customer...</span>
    </div>

    <!-- Form Content -->
    <div v-else class="space-y-6">
      <!-- Customer Basic Info -->
      <Card class="border-dashed border-blue-200 bg-blue-50/30">
        <CardHeader class="pb-4">
          <CardTitle class="text-lg flex items-center gap-2">
            <Building class="w-5 h-5 text-blue-600" />
            Data Customer
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Customer Name -->
            <div class="space-y-2">
              <Label for="customerName" class="text-sm font-medium flex items-center gap-1">
                Nama Customer <span class="text-red-500">*</span>
                <AlertCircle v-if="errors.customerName" class="w-4 h-4 text-red-500" />
              </Label>
              <Input
                id="customerName"
                v-model="customerName"
                placeholder="Contoh: PT Nusantara Jaya"
                :class="{ 'border-red-500 focus:border-red-500': errors.customerName }"
                class="transition-colors"
              />
              <p v-if="errors.customerName" class="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ errors.customerName }}
              </p>
            </div>

            <!-- Customer ID -->
            <div class="space-y-2">
              <Label for="customerId" class="text-sm font-medium">
                Customer ID <span class="text-red-500">*</span>
              </Label>
              <div class="relative">
                <Input
                  id="customerId"
                  v-model="customerId"
                  type="number"
                  placeholder="ID Customer"
                  :class="{ 'border-red-500 focus:border-red-500': errors.customerId }"
                  readonly
                />
                <Badge 
                  v-if="customerId" 
                  variant="secondary" 
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs"
                >
                  Verified
                </Badge>
              </div>
              <p v-if="errors.customerId" class="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ errors.customerId }}
              </p>
              <p v-else-if="customerId" class="text-green-600 text-xs">
                ✓ Customer ID valid
              </p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Phone -->
            <div class="space-y-2">
              <Label for="customerPhone" class="text-sm font-medium flex items-center gap-1">
                <Phone class="w-4 h-4" />
                Nomor Telepon <span class="text-red-500">*</span>
              </Label>
              <Input
                id="customerPhone"
                v-model="customerPhone"
                placeholder="+62-21-1234-5678"
                :class="{ 'border-red-500 focus:border-red-500': errors.customerPhone }"
              />
              <p v-if="errors.customerPhone" class="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ errors.customerPhone }}
              </p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <Label for="customerEmail" class="text-sm font-medium flex items-center gap-1">
                <Mail class="w-4 h-4" />
                Email (Opsional)
              </Label>
              <Input
                id="customerEmail"
                v-model="customerEmail"
                type="email"
                placeholder="contact@company.com"
                :class="{ 'border-red-500 focus:border-red-500': errors.customerEmail }"
              />
              <p v-if="errors.customerEmail" class="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {{ errors.customerEmail }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center pt-6 border-t">
        <div class="text-sm text-gray-500">
          Langkah 1 dari 5 - Informasi Customer
        </div>
        
        <Button
          @click="handleNext"
          :disabled="!isFormValid || loading"
          class="flex items-center gap-2 min-w-[140px]"
        >
          Lanjut ke Alamat
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>

      <!-- Form Validation Summary -->
      <div v-if="Object.keys(errors).length > 0" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle class="w-4 h-4" />
          <span class="font-medium">Harap perbaiki kesalahan berikut:</span>
        </div>
        <ul class="text-sm text-red-600 space-y-1">
          <li v-for="(error, field) in errors" :key="field">• {{ error }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
