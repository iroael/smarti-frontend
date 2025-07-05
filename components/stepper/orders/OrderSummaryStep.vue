// Enhanced version with improvements and bug fixes
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileText,
  Package,
  User,
  MapPin,
  Calendar,
  Clock,
  ShoppingCart,
  CreditCard,
  Truck,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Check,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Building,
  Home,
  Warehouse,
  Loader2,
  CheckCircle,
  Timer,
  DollarSign
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useProducts } from '@/composables/useProducts'
import { useSalesOrder } from '@/composables/useSalesOrder'

const { createSalesOrder } = useSalesOrder()

// Types
interface CustomerInfo {
  id?: string | number
  customerId?: string | number
  name?: string
  customerName?: string
  phone?: string
  customerPhone?: string
  email?: string
  customerEmail?: string
  company?: string
}

interface AddressInfo {
  id: string | number
  name: string
  phone: string
  label: string
  address: string
  city: string
  province: string
  postalCode: string
  type: 'home' | 'office' | 'warehouse'
  isDefault: boolean
}

interface ShippingOption {
  id: string
  courierCode: string
  courierName: string
  service: string
  description?: string
  cost: number
  etd: string
  note?: string
}

interface FormData {
  customerInfo: CustomerInfo
  customerAddresses: AddressInfo[]
  selectedAddressId: string | number
  selectedShippingId?: string
  selectedShippingOption?: ShippingOption
  shippingOptions?: ShippingOption[]
  shippingCost?: number
  estimatedDelivery?: string
  courierName?: string
  serviceName?: string
  selectedItems: any[]
  deliveryDate?: string
  deliveryTime?: string
  orderNotes?: string
  includePPN?: boolean
}

// Props & Emits
interface Props {
  formData: FormData
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous', 'edit-step'])

// Composables
const { bundleProducts } = useProducts()

// Local state
const orderNotes = ref(props.formData.orderNotes || '')
const isSubmitting = ref(false)

// Constants
const PPN_RATE = 0.11

// Enhanced shipping zones with more cities
const DEFAULT_SHIPPING_ZONES = {
  'Jakarta': { cost: 25000, estimatedDays: '1-2' },
  'Tangerang': { cost: 35000, estimatedDays: '1-2' },
  'Bekasi': { cost: 35000, estimatedDays: '1-2' },
  'Depok': { cost: 35000, estimatedDays: '1-2' },
  'Bogor': { cost: 40000, estimatedDays: '2-3' },
  'Bandung': { cost: 75000, estimatedDays: '2-3' },
  'Surabaya': { cost: 150000, estimatedDays: '3-4' },
  'Yogyakarta': { cost: 100000, estimatedDays: '3-4' },
  'Semarang': { cost: 125000, estimatedDays: '3-4' },
  'Medan': { cost: 175000, estimatedDays: '4-5' },
  'Makassar': { cost: 200000, estimatedDays: '4-5' },
  'Palembang': { cost: 175000, estimatedDays: '3-4' },
  'default': { cost: 50000, estimatedDays: '2-4' }
} as const

// Computed - Normalize customer info with better error handling
const customerInfo = computed(() => {
  const customer = props.formData.customerInfo || {}
  return {
    id: customer.id || customer.customerId || null,
    name: (customer.name || customer.customerName || '').trim(),
    phone: (customer.phone || customer.customerPhone || '').trim(),
    email: (customer.email || customer.customerEmail || '').trim(),
    company: (customer.company || '').trim()
  }
})

// Computed - Selected delivery address with better validation
// Selected Address - berdasarkan ID
const selectedAddress = computed(() => {
  const addressId = props.formData.selectedAddressId
  const address = props.formData.selectedAddress

  console.log('📌 Debug selectedAddressId:', addressId)
  console.log('📌 Debug address:', address)

  if (!address || typeof address !== 'object') return null
  if (!addressId) return null

  const match = String(address.id) === String(addressId)
  console.log('✅ Match status:', match)

  return match ? address : null
})

// Computed - Enhanced delivery info
const deliveryInfo = computed(() => {
  const addr = selectedAddress.value

  console.log('📦 deliveryInfo selectedAddress.value:', addr)

  // Jika belum ada yang terpilih, kembalikan struktur default
  if (!addr) {
    return {
      name: '',
      phone: '',
      label: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      type: 'home' as const,
      isDefault: false,
      fullAddress: '',
      isSelected: false
    }
  }

  // Pastikan semua properti ada untuk merangkai alamat lengkap
  const fullAddress = [
    addr.address || '',
    addr.city || '',
    addr.province || '',
    addr.postalCode || ''
  ].filter(Boolean).join(', ')

  const result = {
    ...addr,
    fullAddress,
    isSelected: true
  }

  console.log('✅ Final deliveryInfo:', result)

  return result
})


// Computed - Enhanced shipping calculation
const selectedShipping = computed(() => {
  // Priority 1: Use selectedShippingOption from formData
  if (props.formData.selectedShippingOption) {
    return props.formData.selectedShippingOption
  }
  
  // Priority 2: Find by selectedShippingId in shippingOptions array
  const shippingId = props.formData.selectedShippingId
  const shippingOptions = props.formData.shippingOptions || []
  
  if (shippingId && shippingOptions.length) {
    return shippingOptions.find(option => option.id === shippingId) || null
  }
  
  return null
})

// Computed - Enhanced shipping cost calculation
const shippingCost = computed(() => {
  // Priority 1: Use selected shipping option
  if (selectedShipping.value) {
    return {
      cost: selectedShipping.value.cost,
      estimatedDays: formatDeliveryTime(selectedShipping.value.etd),
      name: `${selectedShipping.value.courierName} - ${selectedShipping.value.service}`,
      description: selectedShipping.value.description || `Layanan ${selectedShipping.value.service}`,
      courierCode: selectedShipping.value.courierCode,
      courierName: selectedShipping.value.courierName,
      service: selectedShipping.value.service,
      etd: selectedShipping.value.etd,
      note: selectedShipping.value.note || '',
      isSelected: true,
      isFromAPI: true
    }
  }
  
})

// Computed - Order items with better error handling
const selectedItems = computed(() => props.formData.selectedItems || [])

// Computed - Enhanced price calculations
const subtotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    try {
      const product = bundleProducts.value?.find(p => p.id === item.productId)
      const price = parseFloat(product?.prices?.[0]?.h_jual_b || '0')
      return sum + (price * (item.quantity || 0))
    } catch (error) {
      console.warn('Error calculating item subtotal:', error)
      return sum
    }
  }, 0)
})

const shippingAmount = computed(() => shippingCost.value.cost || 0)

const ppnAmount = computed(() => {
  const baseAmount = subtotal.value
  return props.formData.includePPN ? Math.round(baseAmount * PPN_RATE) : 0
})

const total = computed(() => subtotal.value + shippingAmount.value + ppnAmount.value)

const includePPN = computed(() => props.formData.includePPN ?? true)

// Computed - Enhanced order summary
const orderSummary = computed(() => {
  const items = selectedItems.value.map(item => {
    try {
      const product = bundleProducts.value?.find(p => p.id === item.productId)
      const price = parseFloat(product?.prices?.[0]?.h_jual_b || '0')
      return {
        ...item,
        product,
        price,
        subtotal: price * (item.quantity || 0)
      }
    } catch (error) {
      console.warn('Error processing order item:', error)
      return {
        ...item,
        product: null,
        price: 0,
        subtotal: 0
      }
    }
  })

  return {
    items,
    totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    itemCount: items.length,
    subtotal: subtotal.value,
    shippingCost: shippingAmount.value,
    shippingInfo: shippingCost.value,
    ppnAmount: ppnAmount.value,
    total: total.value,
    includePPN: includePPN.value,
    deliveryInfo: deliveryInfo.value,
    selectedShipping: selectedShipping.value
  }
})

// Computed - Delivery schedule with better formatting
const deliveryDate = computed(() => {
  if (props.formData.deliveryDate) {
    try {
      return new Date(props.formData.deliveryDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.warn('Error formatting delivery date:', error)
      return props.formData.deliveryDate
    }
  }
  return '-'
})

const deliveryTime = computed(() => props.formData.deliveryTime || '-')

// Computed - Enhanced form validation
const isFormValid = computed(() => {
  const hasItems = orderSummary.value.items.length > 0 && orderSummary.value.totalQuantity > 0
  const hasCustomerInfo = customerInfo.value.name && customerInfo.value.phone
  const hasDeliveryAddress = deliveryInfo.value.isSelected && deliveryInfo.value.address
  const hasShippingInfo = shippingAmount.value > 0
  const hasValidItems = orderSummary.value.items.every(item => item.product && item.price > 0)
  
  return hasItems && hasCustomerInfo && hasDeliveryAddress && hasShippingInfo && hasValidItems
})

// Enhanced helper functions
const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  } catch (error) {
    return `Rp ${(amount || 0).toLocaleString('id-ID')}`
  }
}

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '-'
  const clean = phone.replace(/\D/g, '')
  if (clean.length >= 10) {
    return clean.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3')
  }
  return phone
}

// Enhanced delivery time formatting
const formatDeliveryTime = (etd: string): string => {
  if (!etd) return 'Estimasi tidak tersedia'
  
  // Handle different ETD formats
  if (etd.includes('-')) {
    const [min, max] = etd.split('-').map(s => s.trim())
    return `${min}-${max} hari`
  }
  
  // Handle single day
  const dayMatch = etd.match(/\d+/)
  if (dayMatch) {
    return `${dayMatch[0]} hari`
  }
  
  return `${etd} hari`
}

// Enhanced icon and color functions
const getServiceIcon = (service: string) => {
  if (!service) return Truck
  
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

const getServiceColor = (service: string) => {
  if (!service) return 'bg-gray-100 text-gray-700 border-gray-200'
  
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

const getAddressTypeIcon = (type: string) => {
  switch (type) {
    case 'office': return Building
    case 'warehouse': return Warehouse
    default: return Home
  }
}

const getAddressTypeColor = (type: string) => {
  switch (type) {
    case 'office': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'warehouse': return 'bg-orange-100 text-orange-700 border-orange-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getAddressTypeLabel = (type: string) => {
  switch (type) {
    case 'office': return 'Kantor'
    case 'warehouse': return 'Gudang'
    default: return 'Rumah'
  }
}

// Navigation handlers
const handleEditStep = (step: number) => {
  console.log('step', step)
  emit('edit-step', step)
}

const handlePrevious = () => {
  emit('previous')
}

// Enhanced submit handler
const handleSubmit = async () => {
  if (!isFormValid.value) {
    const missingFields = []
    if (orderSummary.value.items.length === 0) missingFields.push('produk')
    if (!customerInfo.value.name) missingFields.push('nama pelanggan')
    if (!customerInfo.value.phone) missingFields.push('nomor telepon')
    if (!deliveryInfo.value.isSelected) missingFields.push('alamat pengiriman')
    if (shippingAmount.value <= 0) missingFields.push('metode pengiriman')

    const message = missingFields.length > 0 
      ? `Harap lengkapi: ${missingFields.join(', ')}`
      : 'Harap lengkapi semua informasi yang diperlukan'

    toast.error(message)
    return
  }

  isSubmitting.value = true
  try {
    const finalOrderData = {
      orderNotes: orderNotes.value.trim(),
      finalOrderSummary: orderSummary.value,
      finalTotal: total.value,
      finalSubtotal: subtotal.value,
      finalShippingCost: shippingAmount.value,
      finalPpnAmount: ppnAmount.value,
      customerInfo: customerInfo.value,
      deliveryInfo: deliveryInfo.value,
      shippingInfo: shippingCost.value,
      selectedAddress: selectedAddress.value,
      selectedShipping: selectedShipping.value,
      orderDate: new Date().toISOString(),
      orderStatus: 'pending',
      deliveryDate: props.formData.deliveryDate,
      deliveryTime: props.formData.deliveryTime,
    }
    console.log('finalOrderData', finalOrderData)

    // 🔥 Call the real createSalesOrder
    const payload = {
      customerId: customerInfo.value.id,
      notes: finalOrderData.orderNotes,
      deliveryAddress: selectedAddress.value?.id,
      shippingCost: shippingAmount.value,
      items: orderSummary.value.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }

    const createdOrder = await createSalesOrder(payload)

    if (!createdOrder) {
      toast.error('Gagal membuat pesanan di server.')
      return
    }

    toast.success('Pesanan berhasil dibuat!')
    // Kalau backend return snapToken
    if (createdOrder?.snapToken) {

      const snapUrl = createdOrder.snapToken
      window.open(snapUrl, '_blank')
      // window.snap.pay(createdOrder.snapToken, {
      //   onSuccess: function(result) {
      //     toast.success('Pembayaran berhasil!')
      //   },
      //   onPending: function(result) {
      //     toast('Pembayaran masih pending.')
      //   },
      //   onError: function(result) {
      //     toast.error('Pembayaran gagal.')
      //   },
      // })
    }
    emit('update', finalOrderData)
    emit('next', 5)

  } catch (error) {
    console.error('❌ Gagal submit pesanan:', error)
    toast.error('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}


// Watchers with debouncing
let timeoutId: NodeJS.Timeout | null = null

watch(orderNotes, (val) => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    emit('update', { orderNotes: val.trim() })
  }, 300) // Debounce 300ms
})

// Lifecycle
onMounted(() => {
  console.log('📦 OrderSummary loaded:', {
    customerInfo: customerInfo.value,
    selectedAddress: selectedAddress.value,
    deliveryInfo: deliveryInfo.value,
    selectedShipping: selectedShipping.value,
    shippingCost: shippingCost.value,
    orderSummary: orderSummary.value,
    isFormValid: isFormValid.value,
  })
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <FileText class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Ringkasan Pesanan</h3>
          <p class="text-sm text-gray-500">Periksa kembali detail pesanan Anda</p>
        </div>
      </div>

      <!-- Order Status -->
      <div class="flex items-center gap-2">
        <Badge variant="outline" class="bg-blue-50 text-blue-700 border-blue-200">
          <Clock class="w-3 h-3 mr-1" />
          Draft
        </Badge>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Information -->
        <Card>
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg flex items-center gap-2">
                <User class="w-5 h-5 text-blue-600" />
                Informasi Pelanggan
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                @click="handleEditStep(1)"
                class="text-blue-600 hover:text-blue-700"
              >
                <Edit3 class="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="!customerInfo.name" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center gap-2">
                <AlertCircle class="w-4 h-4 text-yellow-600" />
                <span class="text-sm text-yellow-800">Data pelanggan belum tersedia</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div>
                  <Label class="text-sm font-medium text-gray-600">Nama Lengkap</Label>
                  <p class="text-gray-900 font-medium">
                    {{ customerInfo.name || 'Belum diisi' }}
                  </p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-gray-600">No. Telepon</Label>
                  <p class="text-gray-900 flex items-center gap-2">
                    <Phone class="w-4 h-4 text-gray-400" />
                    {{ formatPhoneNumber(customerInfo.phone) }}
                  </p>
                </div>
              </div>
              <div class="space-y-3">
                <div>
                  <Label class="text-sm font-medium text-gray-600">Email</Label>
                  <p class="text-gray-900 flex items-center gap-2">
                    <Mail class="w-4 h-4 text-gray-400" />
                    {{ customerInfo.email || 'Belum diisi' }}
                  </p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-gray-600">Customer ID</Label>
                  <Badge variant="secondary" class="text-xs">
                    ID: {{ customerInfo.id || 'Auto-generate' }}
                  </Badge>
                </div>
              </div>
            </div>

            <div v-if="customerInfo.company" class="mt-4 pt-3 border-t border-gray-200">
              <div>
                <Label class="text-sm font-medium text-gray-600">Perusahaan</Label>
                <p class="text-gray-900 flex items-center gap-2">
                  <Building class="w-4 h-4 text-gray-400" />
                  {{ customerInfo.company }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Delivery Information - Enhanced -->
        <Card>
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg flex items-center gap-2">
                <Truck class="w-5 h-5 text-green-600" />
                Informasi Pengiriman
              </CardTitle>
              <div class="flex items-center gap-2">
                <Badge
                  v-if="deliveryInfo.isSelected"
                  variant="default"
                  class="bg-green-100 text-green-700 border-green-200"
                >
                  <CheckCircle class="w-3 h-3 mr-1" />
                  Terpilih
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleEditStep(2)"
                  class="text-blue-600 hover:text-blue-700"
                >
                  <Edit3 class="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="!deliveryInfo.isSelected" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center gap-2">
                <AlertCircle class="w-4 h-4 text-red-600" />
                <span class="text-sm text-red-800">Alamat pengiriman belum dipilih</span>
              </div>
            </div>

            <div v-else class="space-y-4">
              <!-- Address Header -->
              <div class="flex items-center gap-2 mb-3">
                <component
                  :is="getAddressTypeIcon(deliveryInfo.type)"
                  class="w-5 h-5 text-gray-600"
                />
                <span class="font-semibold text-lg">{{ deliveryInfo.label }}</span>
                <Badge
                  variant="outline"
                  :class="getAddressTypeColor(deliveryInfo.type)"
                  class="text-xs"
                >
                  {{ getAddressTypeLabel(deliveryInfo.type) }}
                </Badge>
                <Badge 
                  v-if="deliveryInfo.isDefault"
                  variant="secondary"
                  class="bg-green-100 text-green-700 border-green-200 text-xs"
                >
                  Default
                </Badge>
              </div>

              <!-- Recipient Info -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label class="text-sm font-medium text-gray-600">Nama Penerima</Label>
                    <p class="text-gray-900 font-semibold">{{ deliveryInfo.name }}</p>
                  </div>
                  <div>
                    <Label class="text-sm font-medium text-gray-600">No. Telepon</Label>
                    <p class="text-gray-900 flex items-center gap-2 font-semibold">
                      <Phone class="w-4 h-4 text-gray-400" />
                      {{ formatPhoneNumber(deliveryInfo.phone) }}
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Full Address -->
              <div class="bg-blue-50 p-4 rounded-lg">
                <Label class="text-sm font-medium text-blue-800 flex items-center gap-2 mb-2">
                  <MapPin class="w-4 h-4" />
                  Alamat Lengkap
                </Label>
                <p class="text-blue-900 font-medium leading-relaxed">
                  {{ deliveryInfo.fullAddress }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Shipping Option - ENHANCED with proper data display -->
        <Card v-if="deliveryInfo.isSelected">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg flex items-center gap-2">
                <CreditCard class="w-5 h-5 text-purple-600" />
                Metode Pengiriman
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                @click="handleEditStep(3)"
                class="text-blue-600 hover:text-blue-700"
              >
                <Edit3 class="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <component 
                      :is="getServiceIcon(shippingCost.service)"
                      class="w-5 h-5 text-purple-600"
                    />
                  </div>
                  <div>
                    <h4 class="font-semibold text-purple-900">{{ shippingCost.name }}</h4>
                    <p class="text-sm text-purple-700">{{ shippingCost.description }}</p>
                    <div v-if="shippingCost.courierCode" class="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline"
                        :class="getServiceColor(shippingCost.service)"
                        class="text-xs"
                      >
                        {{ shippingCost.courierCode.toUpperCase() }}
                      </Badge>
                      <Badge 
                        v-if="shippingCost.isFromAPI"
                        variant="outline"
                        class="bg-green-100 text-green-700 border-green-200 text-xs"
                      >
                        Live Rate
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge 
                  :variant="shippingCost.isSelected ? 'default' : 'outline'"
                  class="bg-purple-100 text-purple-700 border-purple-200"
                >
                  {{ shippingCost.isSelected ? (shippingCost.isFromAPI ? 'Terpilih' : 'Default') : 'Fallback' }}
                </Badge>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/70 p-3 rounded-lg">
                  <Label class="text-sm font-medium text-purple-800 flex items-center gap-1">
                    <DollarSign class="w-3 h-3" />
                    Biaya Pengiriman
                  </Label>
                  <p class="text-purple-900 font-bold text-lg">{{ formatCurrency(shippingCost.cost) }}</p>
                </div>
                <div class="bg-white/70 p-3 rounded-lg">
                  <Label class="text-sm font-medium text-purple-800 flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    Estimasi Pengiriman
                  </Label>
                  <p class="text-purple-900 font-bold">{{ shippingCost.estimatedDays }}</p>
                </div>
              </div>
              
              <div class="mt-3 text-sm text-purple-700">
                <p>• Pengiriman ke: <span class="font-semibold">{{ deliveryInfo.city }}, {{ deliveryInfo.province }}</span></p>
                <p v-if="shippingCost.note">• {{ shippingCost.note }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Delivery Schedule -->
        <Card v-if="deliveryDate !== '-' || deliveryTime !== '-'">
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Calendar class="w-5 h-5 text-orange-600" />
              Jadwal Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <Calendar class="w-4 h-4" />
                    Tanggal Pengiriman
                  </Label>
                  <p class="text-orange-900 font-semibold">{{ deliveryDate }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <Clock class="w-4 h-4" />
                    Waktu Pengiriman
                  </Label>
                  <p class="text-orange-900 font-semibold">{{ deliveryTime }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Items -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg flex items-center gap-2">
                <ShoppingCart class="w-5 h-5 text-indigo-600" />
                Item Pesanan
                <Badge variant="secondary" class="ml-2">
                  {{ orderSummary.totalQuantity }} item
                </Badge>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                @click="handleEditStep(4)"
                class="text-blue-600 hover:text-blue-700"
              >
                <Edit3 class="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="orderSummary.items.length === 0" class="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <div class="flex flex-col items-center gap-2">
                <ShoppingCart class="w-8 h-8 text-gray-400" />
                <p class="text-gray-600">Belum ada item yang dipilih</p>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(item, index) in orderSummary.items"
                :key="index"
                class="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package class="w-6 h-6 text-indigo-600" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-gray-900 truncate">
                          {{ item.product?.name || `Produk ID: ${item.productId}` }}
                        </h4>
                        <div class="flex items-center gap-4 mt-1">
                          <span class="text-sm text-gray-600">
                            Qty: <span class="font-medium">{{ item.quantity }}</span>
                          </span>
                          <span class="text-sm text-gray-600">
                            @ {{ formatCurrency(item.price) }}
                          </span>
                          <Badge
                            variant="outline"
                            class="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            ID: {{ item.product.product_code }}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="text-right ml-4">
                    <p class="font-bold text-lg text-gray-900">
                      {{ formatCurrency(item.subtotal) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Notes -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <FileText class="w-5 h-5 text-teal-600" />
              Catatan Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <Label for="orderNotes" class="text-sm font-medium text-gray-700">
                Tambahkan catatan khusus untuk pesanan ini (opsional)
              </Label>
              <Textarea
                id="orderNotes"
                v-model="orderNotes"
                placeholder="Contoh: Kirim sore hari, jangan ditinggal di depan pintu..."
                class="min-h-[100px] resize-none"
                :disabled="isSubmitting"
              />
              <p class="text-xs text-gray-500">
                Catatan akan diteruskan ke tim pengiriman
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar - Order Summary & Actions -->
      <div class="lg:col-span-1">
        <div class="sticky top-6 space-y-6">
          <!-- Price Summary -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <CreditCard class="w-5 h-5 text-green-600" />
                Ringkasan Biaya
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Subtotal -->
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Subtotal Produk</span>
                <span class="font-semibold">{{ formatCurrency(orderSummary.subtotal) }}</span>
              </div>
              
              <!-- Shipping Cost -->
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">Biaya Pengiriman</span>
                  <Info
                    class="w-4 h-4 text-gray-400 cursor-help"
                    :title="shippingCost.description"
                  />
                </div>
                <span class="font-semibold">{{ formatCurrency(orderSummary.shippingCost) }}</span>
              </div>

              <Separator />

              <!-- PPN -->
              <div v-if="includePPN" class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">PPN (11%)</span>
                  <Badge variant="outline" class="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    Tax
                  </Badge>
                </div>
                <span class="font-semibold">{{ formatCurrency(orderSummary.ppnAmount) }}</span>
              </div>

              <Separator />

              <!-- Total -->
              <div class="flex justify-between items-center text-lg">
                <span class="font-bold text-gray-900">Total Pembayaran</span>
                <span class="font-bold text-green-600 text-xl">{{ formatCurrency(orderSummary.total) }}</span>
              </div>

              <!-- Items Summary -->
              <div class="bg-gray-50 p-3 rounded-lg mt-4">
                <div class="text-sm text-gray-600 space-y-1">
                  <div class="flex justify-between">
                    <span>Total Item:</span>
                    <span class="font-medium">{{ orderSummary.itemCount }} produk</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Total Kuantitas:</span>
                    <span class="font-medium">{{ orderSummary.totalQuantity }} pcs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Validation Status -->
          <Card v-if="!isFormValid">
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2 text-red-600">
                <AlertCircle class="w-5 h-5" />
                Validasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <div v-if="!customerInfo.name || !customerInfo.phone" class="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle class="w-4 h-4" />
                  <span>Data pelanggan tidak lengkap</span>
                </div>
                <div v-if="!deliveryInfo.isSelected" class="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle class="w-4 h-4" />
                  <span>Alamat pengiriman belum dipilih</span>
                </div>
                <div v-if="orderSummary.items.length === 0" class="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle class="w-4 h-4" />
                  <span>Belum ada item yang dipilih</span>
                </div>
                <div v-if="orderSummary.shippingCost <= 0" class="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle class="w-4 h-4" />
                  <span>Metode pengiriman belum valid</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Actions -->
          <Card>
            <CardContent class="p-4">
              <div class="space-y-3">
                <!-- Submit Button -->
                <Button 
                  @click="handleSubmit"
                  :disabled="!isFormValid || isSubmitting"
                  class="w-full"
                  size="lg"
                >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
                  <Check v-else class="w-4 h-4 mr-2" />
                  {{ isSubmitting ? 'Memproses...' : 'Buat Pesanan' }}
                </Button>

                <!-- Previous Button -->
                <Button 
                  variant="outline" 
                  @click="handlePrevious"
                  :disabled="isSubmitting"
                  class="w-full"
                  size="lg"
                >
                  <ChevronLeft class="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </div>

              <!-- Form Validation Info -->
              <div class="mt-4 text-xs text-gray-500 text-center">
                <p v-if="isFormValid" class="text-green-600">
                  ✓ Semua data sudah lengkap
                </p>
                <p v-else class="text-red-600">
                  ! Lengkapi semua data yang diperlukan
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Help Info -->
          <Card class="bg-blue-50 border-blue-200">
            <CardContent class="p-4">
              <div class="flex items-start gap-3">
                <Info class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                  <h4 class="font-semibold text-blue-900 mb-1">Bantuan</h4>
                  <p class="text-blue-800 mb-2">Pastikan semua informasi sudah benar sebelum membuat pesanan.</p>
                  <ul class="text-blue-700 space-y-1 text-xs">
                    <li>• Data pelanggan dan alamat pengiriman</li>
                    <li>• Metode pengiriman dan estimasi waktu</li>
                    <li>• Item pesanan dan total biaya</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>