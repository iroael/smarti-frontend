<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-gray-900">Konfirmasi Pesanan</h1>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- Progress Steps -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between relative">
          <div class="absolute top-5 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
          <div class="absolute top-5 left-0 h-0.5 bg-green-500 z-1 transition-all duration-500" 
               :style="`width: ${getProgressWidth()}%`"></div>
          
          <div v-for="(step, index) in steps" :key="index" 
               class="flex flex-col items-center relative z-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300"
                 :class="getStepClass(index)">
              <svg v-if="index < currentStep" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
            </div>
            <span class="text-xs text-center" :class="index <= currentStep ? 'text-green-600' : 'text-gray-500'">
              {{ step }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Shipping Address -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Alamat Pengiriman</h3>
              <button @click="changeAddress" class="text-green-600 hover:text-green-700 text-sm font-medium">
                Ubah Alamat
              </button>
            </div>
            <div class="border rounded-lg p-4 bg-gray-50">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <p class="font-medium text-gray-900">{{ shippingAddress.name }}</p>
                  <p class="text-gray-600 text-sm">{{ shippingAddress.phone }}</p>
                  <p class="text-gray-600 text-sm mt-1">{{ shippingAddress.address }}</p>
                  <span class="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mt-2">
                    Alamat Utama
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Pesanan Anda</h3>
            <div class="space-y-4">
              <div v-for="item in orderItems" :key="item.id" 
                   class="flex items-start gap-4 p-4 border rounded-lg">
                <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 mb-1">{{ item.name }}</h4>
                  <p class="text-gray-600 text-sm mb-2">{{ item.variant }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Qty: {{ item.quantity }}</span>
                    <span class="font-semibold text-gray-900">{{ formatPrice(item.price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Method -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Metode Pengiriman</h3>
            <div class="space-y-3">
              <div v-for="method in shippingMethods" :key="method.id" 
                   class="border rounded-lg p-4 cursor-pointer transition-colors"
                   :class="selectedShipping === method.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
                   @click="selectedShipping = method.id">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <input type="radio" :value="method.id" v-model="selectedShipping" class="text-green-600">
                    <div>
                      <p class="font-medium text-gray-900">{{ method.name }}</p>
                      <p class="text-gray-600 text-sm">{{ method.description }}</p>
                    </div>
                  </div>
                  <span class="font-semibold text-gray-900">{{ formatPrice(method.price) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
            <div class="space-y-3">
              <div v-for="method in paymentMethods" :key="method.id" 
                   class="border rounded-lg p-4 cursor-pointer transition-colors"
                   :class="selectedPayment === method.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'"
                   @click="selectedPayment = method.id">
                <div class="flex items-center gap-3">
                  <input type="radio" :value="method.id" v-model="selectedPayment" class="text-green-600">
                  <img :src="method.icon" :alt="method.name" class="w-8 h-8">
                  <div>
                    <p class="font-medium text-gray-900">{{ method.name }}</p>
                    <p class="text-gray-600 text-sm">{{ method.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Ringkasan Belanja</h3>
            
            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-gray-600">
                <span>Total Harga ({{ getTotalItems() }} barang)</span>
                <span>{{ formatPrice(getSubtotal()) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Total Ongkos Kirim</span>
                <span>{{ formatPrice(getShippingCost()) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Biaya Layanan</span>
                <span>{{ formatPrice(serviceFee) }}</span>
              </div>
              <hr class="my-3">
              <div class="flex justify-between font-semibold text-lg text-gray-900">
                <span>Total Belanja</span>
                <span class="text-green-600">{{ formatPrice(getTotal()) }}</span>
              </div>
            </div>

            <button @click="processOrder" 
                    :disabled="!selectedShipping || !selectedPayment || isProcessing"
                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
              <span v-else>Buat Pesanan</span>
            </button>

            <p class="text-xs text-gray-500 text-center mt-3">
              Dengan berbelanja, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Reactive data
const currentStep = ref(1)
const selectedShipping = ref('')
const selectedPayment = ref('')
const isProcessing = ref(false)

const steps = [
  'Keranjang',
  'Konfirmasi',
  'Pembayaran',
  'Selesai'
]

const shippingAddress = {
  name: 'John Doe',
  phone: '+62 812-3456-7890',
  address: 'Jl. Sudirman No. 123, Menteng, Jakarta Pusat, DKI Jakarta 10110'
}

const orderItems = ref([
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    variant: '256GB, Deep Purple',
    quantity: 1,
    price: 18999000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'AirPods Pro 2nd Gen',
    variant: 'White',
    quantity: 1,
    price: 3999000,
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
  }
])

const shippingMethods = [
  {
    id: 'regular',
    name: 'Reguler (5-7 hari)',
    description: 'Pengiriman standar dengan jaminan keamanan',
    price: 15000
  },
  {
    id: 'express',
    name: 'Express (2-3 hari)',
    description: 'Pengiriman cepat untuk kebutuhan mendesak',
    price: 25000
  },
  {
    id: 'same-day',
    name: 'Same Day (Hari ini)',
    description: 'Pengiriman di hari yang sama (area tertentu)',
    price: 50000
  }
]

const paymentMethods = [
  {
    id: 'gopay',
    name: 'GoPay',
    description: 'Bayar dengan GoPay, praktis dan aman',
    icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=32&h=32&fit=crop'
  },
  {
    id: 'ovo',
    name: 'OVO',
    description: 'Bayar dengan OVO, cashback hingga 50%',
    icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=32&h=32&fit=crop'
  },
  {
    id: 'bank-transfer',
    name: 'Transfer Bank',
    description: 'Transfer manual ke rekening bank',
    icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=32&h=32&fit=crop'
  },
  {
    id: 'credit-card',
    name: 'Kartu Kredit',
    description: 'Visa, Mastercard, JCB',
    icon: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=32&h=32&fit=crop'
  }
]

const serviceFee = 2500

// Computed properties
const getProgressWidth = () => {
  return ((currentStep.value) / (steps.length - 1)) * 100
}

const getStepClass = (index: number) => {
  if (index < currentStep.value) {
    return 'bg-green-500 text-white'
  } else if (index === currentStep.value) {
    return 'bg-green-500 text-white'
  } else {
    return 'bg-gray-200 text-gray-500'
  }
}

const getTotalItems = () => {
  return orderItems.value.reduce((total, item) => total + item.quantity, 0)
}

const getSubtotal = () => {
  return orderItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const getShippingCost = () => {
  const method = shippingMethods.find(m => m.id === selectedShipping.value)
  return method ? method.price : 0
}

const getTotal = () => {
  return getSubtotal() + getShippingCost() + serviceFee
}

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const goBack = () => {
  // Navigate back logic
  console.log('Go back')
}

const changeAddress = () => {
  // Change address logic
  console.log('Change address')
}

const processOrder = async () => {
  if (!selectedShipping.value || !selectedPayment.value) return
  
  isProcessing.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Move to next step
    currentStep.value = 2
    
    // Redirect to payment page or show success
    console.log('Order processed successfully')
  } catch (error) {
    console.error('Error processing order:', error)
  } finally {
    isProcessing.value = false
  }
}

// Set default selections
selectedShipping.value = 'regular'
selectedPayment.value = 'gopay'
</script>

<style scoped>
/* Custom scrollbar for sticky sidebar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>