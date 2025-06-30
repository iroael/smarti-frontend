<!-- pages/sales-order/create.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ChevronRight, User, MapPin, Package, CreditCard, CheckCircle } from 'lucide-vue-next'

// Import step components
import CustomerInfoStep from '@/components/stepper/CustomerInfoStep.vue'
import AddressStep from '@/components/stepper/AddressStep.vue' 
import ProductSelectionStep from '@/components/stepper/ProductSelectionStep.vue'
import OrderSummaryStep from '@/components/stepper/OrderSummaryStep.vue'
// import ConfirmationStep from '@/components/stepper/ConfirmationStep.vue'
import DeliveryStep from '@/components/stepper/DeliveryStep.vue'
// Stepper configuration
const steps = [
  {
    id: 1,
    title: 'Info Customer',
    description: 'Data customer',
    icon: User,
    component: CustomerInfoStep,
  },
  {
    id: 2,
    title: 'Alamat Pengiriman',
    description: 'Pilih alamat',
    icon: MapPin,
    component: AddressStep,
  },
  {
    id: 3,
    title: 'Pilih Produk',
    description: 'Bundle produk',
    icon: Package,
    component: ProductSelectionStep,
  },
  {
    id: 4,
    title: 'Pengiriman',
    description: 'Pengiriman',
    icon: Package,
    component: DeliveryStep,
  },
  {
    id: 5,
    title: 'Ringkasan Order',
    description: 'Review & bayar',
    icon: CreditCard,
    component: OrderSummaryStep,
  },
  // {
  //   id: 6,
  //   title: 'Selesai',
  //   description: 'Konfirmasi',
  //   icon: CheckCircle,
  //   component: ConfirmationStep,
  // },
]

// Current step state
const currentStep = ref(1)
const completedSteps = ref<number[]>([])

// Form data state
const formData = ref({
  // Customer info
  customerName: '',
  customerId: null,
  // Address
  selectedAddressId: null,
  customerAddresses: [],
  // Products
  selectedItems: [],
  // Order details
  notes: '',
  includePPN: true,
  // Pricing
  subtotal: 0,
  ppnAmount: 0,
  total: 0,
  // Order result
  orderId: null,
  snapToken: null,
})

// Computed properties
const currentStepData = computed(() => steps.find(step => step.id === currentStep.value))
const isFirstStep = computed(() => currentStep.value === 1)
const isLastStep = computed(() => currentStep.value === steps.length)
const isStepCompleted = (stepId: number) => completedSteps.value.includes(stepId)
const canProceedToStep = (stepId: number) => {
  // Can go to step 1 always, or if previous step is completed
  return stepId === 1 || completedSteps.value.includes(stepId - 1)
}

// Step navigation functions
const goToStep = (stepId: number) => {
  if (canProceedToStep(stepId)) {
    currentStep.value = stepId
  }
}

const nextStep = () => {
  if (!isLastStep.value) {
    // Mark current step as completed
    if (!completedSteps.value.includes(currentStep.value)) {
      completedSteps.value.push(currentStep.value)
    }
    currentStep.value++
  }
}

const previousStep = () => {
  if (!isFirstStep.value) {
    currentStep.value--
  }
}

// Form data update handler
const updateFormData = (data: any) => {
  formData.value = { ...formData.value, ...data }
}

// Step completion handler
const completeStep = (stepId: number) => {
  if (!completedSteps.value.includes(stepId)) {
    completedSteps.value.push(stepId)
  }
  nextStep()
}

// Reset form
const resetForm = () => {
  currentStep.value = 1
  completedSteps.value = []
  formData.value = {
    customerName: '',
    customerId: null,
    selectedAddressId: null,
    customerAddresses: [],
    selectedItems: [],
    notes: '',
    includePPN: true,
    subtotal: 0,
    ppnAmount: 0,
    total: 0,
    orderId: null,
    snapToken: null,
  }
}

// Page meta
definePageMeta({
  title: 'Buat Sales Order',
  layout: 'default',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Buat Sales Order</h1>
        <p class="text-gray-600 mt-2">Ikuti langkah-langkah berikut untuk membuat sales order</p>
      </div>

      <!-- Stepper Navigation -->
      <Card class="mb-8">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="flex items-center"
              :class="{ 'flex-1': index < steps.length - 1 }"
            >
              <!-- Step Circle -->
              <div class="flex flex-col items-center">
                <button
                  @click="goToStep(step.id)"
                  :disabled="!canProceedToStep(step.id)"
                  class="relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  :class="{
                    // Current step
                    'border-blue-500 bg-blue-500 text-white': currentStep === step.id,
                    // Completed step
                    'border-green-500 bg-green-500 text-white hover:bg-green-600': isStepCompleted(step.id),
                    // Available step
                    'border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-500': canProceedToStep(step.id) && currentStep !== step.id && !isStepCompleted(step.id),
                    // Disabled step
                    'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed': !canProceedToStep(step.id)
                  }"
                >
                  <Check v-if="isStepCompleted(step.id)" class="w-5 h-5" />
                  <component v-else :is="step.icon" class="w-5 h-5" />
                </button>
                <!-- Step Info -->
                <div class="mt-3 text-center">
                  <div class="text-sm font-semibold" :class="{
                    'text-blue-600': currentStep === step.id,
                    'text-green-600': isStepCompleted(step.id),
                    'text-gray-900': canProceedToStep(step.id) && currentStep !== step.id && !isStepCompleted(step.id),
                    'text-gray-400': !canProceedToStep(step.id)
                  }">
                    {{ step.title }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ step.description }}</div>
                </div>
              </div>

              <!-- Connector Line -->
              <div
                v-if="index < steps.length - 1"
                class="flex-1 h-0.5 mx-4 mt-[-24px]"
                :class="{
                  'bg-green-500': isStepCompleted(step.id),
                  'bg-blue-500': currentStep === step.id,
                  'bg-gray-300': !isStepCompleted(step.id) && currentStep !== step.id
                }"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Step Content -->
      <Card class="mb-8">
        <CardContent class="p-0">
          <!-- Dynamic Step Component -->
          <component 
            :is="currentStepData?.component"
            :form-data="formData"
            :current-step="currentStep"
            @update="updateFormData"
            @next="completeStep"
            @previous="previousStep"
          />
        </CardContent>
      </Card>

      <!-- Navigation Buttons (Global) -->
      <div class="flex justify-between items-center">
        <Button
          v-if="!isFirstStep && currentStep < steps.length"
          variant="outline"
          @click="previousStep"
          class="flex items-center gap-2"
        >
          <ChevronRight class="w-4 h-4 rotate-180" />
          Kembali
        </Button>
        <div v-else></div>

        <div class="flex items-center gap-4">
          <!-- Step Progress -->
          <div class="text-sm text-gray-500">
            Langkah {{ currentStep }} dari {{ steps.length }}
          </div>
          
          <!-- Reset Button (show when not on last step) -->
          <Button
            v-if="currentStep < steps.length"
            variant="ghost"
            @click="resetForm"
            class="text-gray-500 hover:text-gray-700"
          >
            Reset Form
          </Button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mt-6">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(completedSteps.length / steps.length) * 100}%` }"
          />
        </div>
        <div class="text-center mt-2 text-sm text-gray-500">
          {{ completedSteps.length }} dari {{ steps.length }} langkah selesai
        </div>
      </div>
    </div>
  </div>
</template>