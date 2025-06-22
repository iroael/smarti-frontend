<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/composables/useAuth'
import { useProducts } from '@/composables/useProducts'
import { useSalesOrder } from '@/composables/useSalesOrder'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

// Types for better type safety
interface Address {
  id: number
  name: string
  phone: string
  city: string
  province: string
  address: string
  postalcode: string
  is_default: boolean
  is_deleted: boolean
  created_at: string
}

interface CustomerProfile {
  id: number
  name: string
  email: string
  phone: string
  npwp: string
  province: string
  city: string
  postalcode: string
  address: string
  addresses: Address[]
}

interface AuthUser {
  id: number
  email: string
  role: string
  profile: CustomerProfile
}

const route = useRoute()
const { user } = useAuth()
const { createSalesOrder } = useSalesOrder()
const { fetchBundleProducts, bundleProducts } = useProducts()

// Customer data refs
const currentCustomer = ref<AuthUser | null>(null)
const customerId = ref<number | null>(null)
const customerProfile = ref<CustomerProfile | null>(null)

// PPN Configuration
const PPN_RATE = 0.11 // 11%

// Customer addresses from profile
const customerAddresses = ref<Address[]>([])

// Form state
const customerName = ref('')
const selectedAddressId = ref<number | null>(null)
const notes = ref('')
const includePPN = ref(true) // Default include PPN
const selectedItems = ref<{ productId: number, quantity: number }[]>([])

// Auto-select mode for URL parameters
const isAutoSelectMode = ref(false)
const preSelectedProductId = ref<number | null>(null)

// Get current customer data from auth store
const fetchCurrentCustomer = async () => {
  try {
    if (!user.value) {
      toast.error('User tidak terautentikasi')
      return
    }

    currentCustomer.value = user.value
    customerProfile.value = user.value.profile

    // Set customer basic info
    customerId.value = user.value.id
    customerName.value = user.value.profile?.name || ''

    // Process addresses from profile
    if (user.value.profile?.addresses && Array.isArray(user.value.profile.addresses)) {
      customerAddresses.value = user.value.profile.addresses.filter(addr => !addr.is_deleted)

      // Set default address
      const defaultAddress = customerAddresses.value.find(addr => addr.is_default)
      selectedAddressId.value = defaultAddress?.id || customerAddresses.value[0]?.id || null

      console.log('Customer addresses loaded:', {
        total: customerAddresses.value.length,
        defaultAddress: defaultAddress?.id,
        selectedAddress: selectedAddressId.value
      })
    } else {
      customerAddresses.value = []
      selectedAddressId.value = null
      console.warn('No addresses found in customer profile')
    }

    console.log('Customer data loaded:', {
      customerId: customerId.value,
      customerName: customerName.value,
      profileId: customerProfile.value?.id,
      addressCount: customerAddresses.value.length
    })

  } catch (err) {
    console.error('Failed to fetch current customer:', err)
    toast.error('Gagal mengambil data customer')
    
    // Reset values on error
    currentCustomer.value = null
    customerProfile.value = null
    customerId.value = null
    customerName.value = ''
    customerAddresses.value = []
    selectedAddressId.value = null
  }
}

// URL Parameter Handler - Fixed Version
const handleUrlParameters = async () => {
  const productId = route.query.product_id
  if (productId) {
    preSelectedProductId.value = parseInt(productId as string, 10)
    isAutoSelectMode.value = true
    
    // Simple polling approach to wait for products
    const waitForProducts = async () => {
      let attempts = 0
      const maxAttempts = 50 // 5 seconds max
      
      while (bundleProducts.value.length === 0 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      if (bundleProducts.value.length > 0) {
        autoSelectProduct()
      } else {
        console.warn('Products not loaded after timeout')
        toast.error('Gagal memuat produk untuk auto-select')
      }
    }
    
    await waitForProducts()
  }
}

const autoSelectProduct = () => {
  if (!preSelectedProductId.value) return
  
  const product = bundleProducts.value.find(p => p.id === preSelectedProductId.value)
  if (product) {
    // Auto-select the product
    if (!isChecked(product.id)) {
      selectedItems.value.push({ 
        productId: product.id, 
        quantity: 1 
      })
    }

    // Show success message
    toast.success(`Produk "${product.name}" telah dipilih otomatis`, {
      description: 'Anda dapat mengubah quantity atau menambah produk lain'
    })

    // Scroll to the selected product
    setTimeout(() => {
      const productElement = document.querySelector(`[data-product-id="${product.id}"]`)
      if (productElement) {
        productElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }, 100)
  } else {
    toast.error('Produk tidak ditemukan', {
      description: `Product ID ${preSelectedProductId.value} tidak tersedia`
    })
  }
}

// Form validation
const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}
  
  if (!customerName.value.trim()) {
    errors.value.customerName = 'Nama customer wajib diisi'
  }

  if (!selectedAddressId.value) {
    errors.value.address = 'Harap pilih alamat pengiriman'
  }
  
  if (!selectedItems.value.length) {
    errors.value.items = 'Harap pilih minimal satu produk bundling'
  }
  
  // Check stock availability
  for (const item of selectedItems.value) {
    const product = bundleProducts.value.find(p => p.id === item.productId)
    if (product && item.quantity > product.stock) {
      errors.value[`stock_${item.productId}`] = `Stok tidak cukup. Tersedia: ${product.stock}`
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// Item management functions
const toggleItem = (productId: number, checked: boolean) => {
  const idx = selectedItems.value.findIndex(i => i.productId === productId)
  if (checked && idx === -1) {
    selectedItems.value.push({ productId, quantity: 1 })
  } else if (!checked && idx !== -1) {
    selectedItems.value.splice(idx, 1)
  }
  // Clear stock error when item is toggled
  delete errors.value[`stock_${productId}`]
}

const updateQuantity = (productId: number, value: number) => {
  const item = selectedItems.value.find(i => i.productId === productId)
  const product = bundleProducts.value.find(p => p.id === productId)
  
  if (item && product) {
    const maxQuantity = Math.min(value, product.stock)
    item.quantity = Math.max(1, maxQuantity)
    
    // Clear stock error if quantity is valid
    if (item.quantity <= product.stock) {
      delete errors.value[`stock_${productId}`]
    }
  }
}

// Helper functions
const isChecked = (productId: number) =>
  selectedItems.value.some(i => i.productId === productId)

const getQuantity = (productId: number) =>
  selectedItems.value.find(i => i.productId === productId)?.quantity || 1

const getProductPrice = (productId: number): number => {
  const product = bundleProducts.value.find(p => p.id === productId)
  return parseFloat(product?.prices?.[0]?.h_jual_b || '0')
}

const getStockStatus = (stock: number) => {
  if (stock === 0) return { label: 'Habis', variant: 'destructive' }
  if (stock <= 5) return { label: 'Terbatas', variant: 'warning' }
  return { label: 'Tersedia', variant: 'success' }
}

const getSelectedAddress = (): Address | null => {
  return customerAddresses.value.find(addr => addr.id === selectedAddressId.value) || null
}

// Address change handler
const handleAddressChange = (value: string | number) => {
  console.log('Address change - Raw value received:', value, typeof value)
  
  let numValue: number
  if (typeof value === 'string') {
    numValue = parseInt(value, 10)
  } else if (typeof value === 'number') {
    numValue = value
  } else {
    console.error('Unexpected value type:', typeof value, value)
    return
  }
  
  console.log('Address change - Converted to number:', numValue)
  selectedAddressId.value = numValue

  // Force reactivity update and clear address error
  setTimeout(() => {
    console.log('Address change - After update:', {
      selectedAddressId: selectedAddressId.value,
      selectedAddress: getSelectedAddress()
    })
    delete errors.value.address
  }, 0)
}

// Computed values for pricing
const subtotal = computed(() =>
  selectedItems.value.reduce((sum, item) => {
    const price = getProductPrice(item.productId)
    return sum + price * item.quantity
  }, 0),
)

const ppnAmount = computed(() => 
  includePPN.value ? subtotal.value * PPN_RATE : 0,
)

const total = computed(() => 
  subtotal.value + ppnAmount.value,
)

const selectedItemsCount = computed(() => selectedItems.value.length)

const totalQuantity = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.quantity, 0),
)

// Form submission
const loading = ref(false)

const resetForm = () => {
  // Don't reset customer info, just reset the form fields
  const defaultAddress = customerAddresses.value.find(addr => addr.is_default)
  selectedAddressId.value = defaultAddress?.id || customerAddresses.value[0]?.id || null
  
  notes.value = ''
  includePPN.value = true
  selectedItems.value = []
  errors.value = {}
  isAutoSelectMode.value = false
  preSelectedProductId.value = null
  
  // Keep customerName and customerId from current customer
  toast.success('Form berhasil direset')
}

const submit = async () => {
  if (!validateForm()) {
    toast.error('Harap perbaiki kesalahan pada form')
    return
  }

  loading.value = true
  try {
    const selectedAddress = getSelectedAddress()
    if (!selectedAddress) {
      toast.error('Alamat pengiriman tidak valid')
      return
    }

    const orderData = {
      customerId: customerId.value,
      customerName: customerName.value,
      selectedAddressId: selectedAddressId.value,
      deliveryAddress: selectedAddress,
      notes: notes.value,
      includePPN: includePPN.value,
      subtotal: subtotal.value,
      ppnAmount: ppnAmount.value,
      total: total.value,
      items: selectedItems.value
    }

    console.log('Submitting sales order:', orderData)

    const response = await createSalesOrder(orderData)

    toast.success('Sales Order berhasil dibuat', {
      description: `Order dengan total Rp ${total.value.toLocaleString('id-ID')} telah disimpan`
    })

    // Handle payment if snapToken is returned
    if (response?.snapToken && window.snap) {
      window.snap.pay(response.snapToken, {
        onSuccess: function(result: any) {
          console.log('Pembayaran sukses:', result)
          toast.success('Pembayaran berhasil!')
          resetForm()
        },
        onPending: function(result: any) {
          console.log('Pembayaran pending:', result)
          toast('Pembayaran masih pending.')
        },
        onError: function(result: any) {
          console.error('Pembayaran error:', result)
          toast.error('Pembayaran gagal.')
        },
      })
    } else {
      resetForm()
    }

    // Refresh product data after successful submission
    await fetchBundleProducts()
    
  } catch (err: any) {
    console.error('Sales order submission failed:', err)
    toast.error('Gagal membuat Sales Order', {
      description: err?.message || 'Terjadi kesalahan tak terduga'
    })
  } finally {
    loading.value = false
  }
}

// Watch for form changes to clear general errors - FIXED VERSION
watch([customerName, selectedAddressId, selectedItems], () => {
  delete errors.value.customerName
  delete errors.value.address
  delete errors.value.items
}, { deep: true })

// Debug watcher for address changes - FIXED VERSION  
watch(selectedAddressId, (newVal, oldVal) => {
  console.log('selectedAddressId watcher - changed from', oldVal, 'to', newVal)
  console.log('selectedAddressId watcher - Selected address:', getSelectedAddress())
}, { immediate: true })

// Initialize data on component mount
onMounted(async () => {
  console.log('Component mounted, initializing...')
  
  try {
    await fetchCurrentCustomer()
    await fetchBundleProducts()
    await handleUrlParameters()
    
    console.log('Component initialization completed')
  } catch (error) {
    console.error('Component initialization failed:', error)
    toast.error('Gagal memuat data awal')
  }
})
</script>
<template>
  <div class="container mx-auto p-6 max-w-6xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Buat Sales Order</h1>
      <p class="text-muted-foreground mt-2">
        Pilih produk bundling dan buat pesanan untuk customer
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Information -->
        <Card>
          <CardHeader>
            <CardTitle>Informasi Customer</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="customerName">Nama Customer</Label>
              <Input
                id="customerName"
                v-model="customerName"
                placeholder="Masukkan nama customer"
                readonly
                class="bg-muted"
              />
              <p v-if="errors.customerName" class="text-sm text-destructive mt-1">
                {{ errors.customerName }}
              </p>
            </div>

            <div>
              <Label for="address">Alamat Pengiriman</Label>
              <Select :value="selectedAddressId?.toString()" @update:value="handleAddressChange">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih alamat pengiriman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="address in customerAddresses"
                    :key="address.id"
                    :value="address.id.toString()"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium">{{ address.name }}</span>
                      <span class="text-sm text-muted-foreground">
                        {{ address.address }}, {{ address.city }}, {{ address.province }}
                      </span>
                      <span class="text-sm text-muted-foreground">
                        {{ address.phone }}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.address" class="text-sm text-destructive mt-1">
                {{ errors.address }}
              </p>
            </div>

            <div>
              <Label for="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                v-model="notes"
                placeholder="Tambahkan catatan untuk pesanan ini"
                rows="3"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Product Selection -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span>Pilih Produk Bundling</span>
              <Badge v-if="selectedItemsCount" variant="secondary">
                {{ selectedItemsCount }} produk dipilih
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="bundleProducts.length === 0" class="text-center py-8">
              <p class="text-muted-foreground">Memuat produk...</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="product in bundleProducts"
                :key="product.id"
                :data-product-id="product.id"
                class="border rounded-lg p-4 space-y-3"
                :class="{ 'border-primary': isChecked(product.id) }"
              >
                <div class="flex items-start space-x-3">
                  <Checkbox
                    :id="`product-${product.id}`"
                    :checked="isChecked(product.id)"
                    @update:checked="(checked) => toggleItem(product.id, checked)"
                  />
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <Label
                        :for="`product-${product.id}`"
                        class="text-base font-medium cursor-pointer"
                      >
                        {{ product.name }}
                      </Label>
                      <Badge :variant="getStockStatus(product.stock).variant">
                        {{ getStockStatus(product.stock).label }}
                      </Badge>
                    </div>
                    
                    <p class="text-sm text-muted-foreground mt-1">
                      {{ product.description || 'Tidak ada deskripsi' }}
                    </p>
                    
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center space-x-4">
                        <span class="text-lg font-semibold text-primary">
                          Rp {{ getProductPrice(product.id).toLocaleString('id-ID') }}
                        </span>
                        <span class="text-sm text-muted-foreground">
                          Stok: {{ product.stock }}
                        </span>
                      </div>
                      
                      <div v-if="isChecked(product.id)" class="flex items-center space-x-2">
                        <Label class="text-sm">Qty:</Label>
                        <Input
                          type="number"
                          :value="getQuantity(product.id)"
                          @input="(e) => updateQuantity(product.id, parseInt((e.target as HTMLInputElement).value) || 1)"
                          min="1"
                          :max="product.stock"
                          class="w-20"
                        />
                      </div>
                    </div>
                    
                    <p v-if="errors[`stock_${product.id}`]" class="text-sm text-destructive mt-1">
                      {{ errors[`stock_${product.id}`] }}
                    </p>
                  </div>
                </div>
              </div>
              
              <p v-if="errors.items" class="text-sm text-destructive">
                {{ errors.items }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Order Summary -->
      <div class="space-y-6">
        <Card class="sticky top-6">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="selectedItems.length === 0" class="text-center py-4">
              <p class="text-muted-foreground">Tidak ada produk dipilih</p>
            </div>
            
            <div v-else class="space-y-4">
              <!-- Selected Items -->
              <div class="space-y-2">
                <h4 class="font-medium">Item Dipilih ({{ totalQuantity }})</h4>
                <div class="space-y-2">
                  <div
                    v-for="item in selectedItems"
                    :key="item.productId"
                    class="flex justify-between text-sm"
                  >
                    <span class="flex-1">
                      {{ bundleProducts.find(p => p.id === item.productId)?.name }}
                      <span class="text-muted-foreground">x{{ item.quantity }}</span>
                    </span>
                    <span class="font-medium">
                      Rp {{ (getProductPrice(item.productId) * item.quantity).toLocaleString('id-ID') }}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <!-- Pricing -->
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span class="font-medium">Rp {{ subtotal.toLocaleString('id-ID') }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      id="includePPN"
                      v-model="includePPN"
                    />
                    <Label for="includePPN" class="text-sm">PPN (11%)</Label>
                  </div>
                  <span class="font-medium">
                    Rp {{ ppnAmount.toLocaleString('id-ID') }}
                  </span>
                </div>
                
                <Separator />
                
                <div class="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span class="text-primary">Rp {{ total.toLocaleString('id-ID') }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-2 pt-4">
                <Button
                  @click="submit"
                  :disabled="loading || selectedItems.length === 0"
                  class="w-full"
                  size="lg"
                >
                  <span v-if="loading">Memproses...</span>
                  <span v-else>Buat Sales Order</span>
                </Button>
                
                <Button
                  @click="resetForm"
                  variant="outline"
                  class="w-full"
                  :disabled="loading"
                >
                  Reset Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>