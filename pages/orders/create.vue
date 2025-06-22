<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useCustomers } from '@/composables/useCustomers'
import { useProducts } from '@/composables/useProducts'
import { useSalesOrder } from '@/composables/useSalesOrder'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const { createSalesOrder } = useSalesOrder()
const { getCurrentCustomer } = useCustomers()
const { fetchBundleProducts, bundleProducts } = useProducts()

const currentCustomer = ref(null)
const customerId = ref<number | null>(null)

const fetchCurrentCustomer = async () => {
  try {
    const response = await getCurrentCustomer()
    currentCustomer.value = response

    const data = response?.data ?? response

    customerName.value = data.name || ''
    customerId.value = data.id || null

    if (Array.isArray(data.addresses)) {
      customerAddresses.value = data.addresses

      const defaultAddress = customerAddresses.value.find(addr => addr.is_default)
      selectedAddressId.value = defaultAddress?.id ?? customerAddresses.value[0]?.id
    }
    else {
      customerAddresses.value = []
    }
  } catch (err) {
    console.error('Failed to fetch current customer:', err)
    toast.error('Gagal mengambil data customer')
  }
}

// PPN Configuration
const PPN_RATE = 0.11 // 11%

// Dummy customer addresses data
const customerAddresses = ref<any[]>([])

// Form state
const customerName = ref('')
const selectedAddressId = ref<number>(1) // Default to first address
const notes = ref('')
const includePPN = ref(true) // Default include PPN
const selectedItems = ref<{ productId: number, quantity: number }[]>([])

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

const getSelectedAddress = () => {
  return customerAddresses.value.find(addr => addr.id === selectedAddressId.value)
}

// Address change handler - Multiple approaches
const handleAddressChange = (value: any) => {
  console.log('Raw value received:', value, typeof value)
  
  let numValue: number
  if (typeof value === 'string') {
    numValue = parseInt(value, 10)
  } else if (typeof value === 'number') {
    numValue = value
  } else {
    console.error('Unexpected value type:', typeof value, value)
    return
  }
  console.log('Converted to number:', numValue)
  selectedAddressId.value = numValue

  // Force reactivity update
  setTimeout(() => {
    console.log('After update - selectedAddressId:', selectedAddressId.value)
    console.log('After update - getSelectedAddress():', getSelectedAddress())
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
  selectedAddressId.value = 1
  notes.value = ''
  includePPN.value = true
  selectedItems.value = []
  errors.value = {}
  // Keep customerName and customerId from current customer
}

const submit = async () => {
  if (!validateForm()) {
    toast.error('Harap perbaiki kesalahan pada form')
    return
  }

  loading.value = true
  try {
    const response = await createSalesOrder({
      customerId: customerId.value, // Include customer ID
      customerName: customerName.value,
      selectedAddressId: selectedAddressId.value,
      deliveryAddress: getSelectedAddress(),
      notes: notes.value,
      includePPN: includePPN.value,
      subtotal: subtotal.value,
      ppnAmount: ppnAmount.value,
      total: total.value,
      items: selectedItems.value
    })

    toast.success('Sales Order berhasil dibuat')

    // Kalau backend return snapToken
    if (response?.snapToken) {
      window.snap.pay(response.snapToken, {
        onSuccess: function(result) {
          console.log('Pembayaran sukses:', result)
          toast.success('Pembayaran berhasil!')
        },
        onPending: function(result) {
          console.log('Pembayaran pending:', result)
          toast('Pembayaran masih pending.')
        },
        onError: function(result) {
          console.error('Pembayaran error:', result)
          toast.error('Pembayaran gagal.')
        },
      })
    }

    resetForm()
    fetchBundleProducts() // Refresh data setelah submit
  } catch (err: any) {
    toast.error('Gagal membuat Sales Order', {
      description: err?.message || 'Terjadi kesalahan tak terduga'
    })
  } finally {
    loading.value = false
  }
}

// Watch for form changes to clear general errors
watch([customerName, selectedAddressId, selectedItems], () => {
  delete errors.value.customerName
  delete errors.value.address
  delete errors.value.items
}, { deep: true })

// Debug watcher - Remove this after testing
watch(selectedAddressId, (newVal, oldVal) => {
  console.log('selectedAddressId changed from', oldVal, 'to', newVal)
  console.log('Selected address:', getSelectedAddress())
}, { immediate: true })

// Initialize data on component mount
onMounted(async () => {
  await fetchCurrentCustomer()
  await fetchBundleProducts()
})
</script>

<template>
  <Card class="w-full max-w-12xl mx-auto">
    <CardHeader class="pb-4">
      <CardTitle class="text-2xl font-bold text-center">Buat Sales Order - Produk Bundling</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="submit" class="space-y-8">
        <!-- Customer Information Section -->
        <Card class="border-dashed">
          <CardHeader class="pb-3">
            <CardTitle class="text-lg">Informasi Customer</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="customerName" class="text-sm font-medium">
                  Nama Customer <span class="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  v-model="customerName"
                  placeholder="Contoh: PT Nusantara"
                  :class="{ 'border-red-500': errors.customerName }"
                  readonly
                />
                <p v-if="errors.customerName" class="text-red-500 text-xs">
                  {{ errors.customerName }}
                </p>
                <p v-if="customerId" class="text-xs text-muted-foreground">
                  Customer ID: {{ customerId }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="address" class="text-sm font-medium">
                  Alamat Pengiriman <span class="text-red-500">*</span>
                </Label>
                
                <Select 
                  v-model="selectedAddressId"
                  :class="{ 'border-red-500': errors.address }"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alamat pengiriman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="address in customerAddresses"
                      :key="address.id"
                      :value="address.id"
                    >
                      <div class="flex flex-col gap-1 py-1">
                        <div class="flex items-center gap-2">
                          <span class="font-medium">{{ address.label }}</span>
                          <Badge v-if="address.isDefault" variant="secondary" class="text-xs">
                            Default
                          </Badge>
                        </div>
                        <span class="text-xs text-muted-foreground">
                          {{ address.address }}, {{ address.city }}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <p v-if="errors.address" class="text-red-500 text-xs">
                  {{ errors.address }}
                </p>
              </div>
            </div>

            <!-- Selected Address Details -->
            <div v-if="selectedAddressId && getSelectedAddress()" class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 shadow-sm">
              <div class="flex items-start justify-between mb-3">
                <h4 class="font-semibold text-blue-900 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Detail Alamat Pengiriman
                </h4>
                <Badge v-if="getSelectedAddress()?.isDefault" variant="secondary" class="text-xs">
                  Alamat Utama
                </Badge>
              </div>
              
              <div class="bg-white p-3 rounded-md border border-blue-200">
                <div class="space-y-2 text-sm">
                  <div class="flex items-start gap-2">
                    <span class="font-medium text-blue-800 w-16 flex-shrink-0">Nama:</span>
                    <span class="font-semibold text-gray-900">{{ getSelectedAddress()?.name }}</span>
                  </div>
                  
                  <div class="flex items-start gap-2">
                    <span class="font-medium text-blue-800 w-16 flex-shrink-0">Telepon:</span>
                    <span class="text-gray-700">{{ getSelectedAddress()?.phone }}</span>
                  </div>
                  
                  <div class="flex items-start gap-2">
                    <span class="font-medium text-blue-800 w-16 flex-shrink-0">Alamat:</span>
                    <div class="text-gray-700">
                      <p>{{ getSelectedAddress()?.address }}</p>
                      <p class="mt-1">
                        <span>{{ getSelectedAddress()?.city }}, {{ getSelectedAddress()?.province }}</span>
                        <span class="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {{ getSelectedAddress()?.postalCode }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="notes" class="text-sm font-medium">Catatan</Label>
              <Textarea
                id="notes"
                v-model="notes"
                placeholder="Catatan tambahan untuk order ini..."
                class="min-h-[80px]"
              />
            </div>

            <!-- PPN Option -->
            <div class="flex items-center space-x-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <Checkbox 
                id="includePPN" 
                v-model:checked="includePPN"
              />
              <Label for="includePPN" class="text-sm font-medium cursor-pointer">
                Termasuk PPN 11%
              </Label>
              <Badge variant="secondary" class="ml-2 text-xs">
                Pajak Pertambahan Nilai
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Product Selection Section -->
        <Card>
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center">
              <CardTitle class="text-lg">Pilih Produk Bundling</CardTitle>
              <Badge variant="outline" v-if="selectedItemsCount > 0">
                {{ selectedItemsCount }} bundle dipilih
              </Badge>
            </div>
            <p v-if="errors.items" class="text-red-500 text-sm">
              {{ errors.items }}
            </p>
          </CardHeader>
          <CardContent class="space-y-6">
            <div
              v-for="bundle in bundleProducts"
              :key="bundle.id"
              class="border rounded-xl p-6 space-y-4 transition-all hover:shadow-md"
              :class="{ 'border-blue-500 bg-blue-50/50': isChecked(bundle.id) }"
            >
              <!-- Bundle Header -->
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="font-bold text-lg">{{ bundle.name }}</h4>
                    <Badge 
                      :variant="getStockStatus(bundle.stock).variant"
                      class="text-xs"
                    >
                      {{ getStockStatus(bundle.stock).label }}
                    </Badge>
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>SKU: <code class="bg-gray-100 px-1 rounded">{{ bundle.product_code }}</code></span>
                    <span>Stok: <strong>{{ bundle.stock }}</strong></span>
                  </div>
                  <div class="mt-2">
                    <span class="text-lg font-semibold text-green-600">
                      Rp {{ Number(bundle.prices?.[0]?.h_jual_b || 0).toLocaleString('id-ID') }}
                    </span>
                  </div>
                </div>

                <!-- Quantity and Checkbox Controls -->
                <div class="flex items-center gap-4">
                  <div class="flex flex-col items-center gap-2">
                    <Label class="text-xs text-muted-foreground">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      :max="bundle.stock"
                      class="w-20 text-center"
                      :disabled="!isChecked(bundle.id) || bundle.stock === 0"
                      :value="getQuantity(bundle.id)"
                      @input="updateQuantity(bundle.id, +($event.target as HTMLInputElement).value)"
                    />
                  </div>
                  <div class="flex flex-col items-center gap-2">
                    <Label class="text-xs text-muted-foreground">Pilih</Label>
                    <input
                      type="checkbox"
                      class="w-5 h-5 rounded"
                      :disabled="bundle.stock === 0"
                      :checked="isChecked(bundle.id)"
                      @change="toggleItem(bundle.id, ($event.target as HTMLInputElement).checked)"
                    />
                  </div>
                </div>
              </div>

              <!-- Stock Error -->
              <p v-if="errors[`stock_${bundle.id}`]" class="text-red-500 text-sm">
                {{ errors[`stock_${bundle.id}`] }}
              </p>

              <!-- Bundle Items Table -->
              <div v-if="bundle.bundleItems?.length" class="pt-4 border-t">
                <h5 class="font-medium mb-3 text-sm text-muted-foreground">Item dalam Bundle:</h5>
                <div class="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class="w-32">Kode Produk</TableHead>
                        <TableHead>Nama Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow
                        v-for="item in bundle.bundleItems"
                        :key="item.product.id"
                        class="hover:bg-muted/50"
                      >
                        <TableCell class="font-mono text-sm">
                          {{ item.product.product_code }}
                        </TableCell>
                        <TableCell>{{ item.product.name }}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!bundleProducts.length" class="text-center py-12 text-muted-foreground">
              <p>Tidak ada produk bundling tersedia</p>
            </div>
          </CardContent>
        </Card>

        <!-- Order Summary and Actions -->
        <Card class="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
          <CardContent class="pt-6">
            <div class="space-y-4">
              <!-- Summary Details -->
              <div class="bg-white p-4 rounded-lg border shadow-sm">
                <h3 class="font-semibold text-lg mb-4 text-gray-800">Ringkasan Order</h3>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center text-gray-600">
                    <span>{{ selectedItemsCount }} bundle dipilih ({{ totalQuantity }} total item)</span>
                  </div>
                  
                  <Separator />
                  
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">Subtotal:</span>
                    <span class="font-medium">Rp {{ subtotal.toLocaleString('id-ID') }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center" :class="{ 'text-amber-600': includePPN }">
                    <span class="flex items-center gap-2">
                      PPN 11%:
                      <Badge v-if="includePPN" variant="secondary" class="text-xs">Aktif</Badge>
                      <Badge v-else variant="outline" class="text-xs">Tidak Aktif</Badge>
                    </span>
                    <span class="font-medium">Rp {{ ppnAmount.toLocaleString('id-ID') }}</span>
                  </div>
                  
                  <Separator />
                  
                  <div class="flex justify-between items-center text-lg font-bold text-blue-600">
                    <span>Total Bayar:</span>
                    <span>Rp {{ total.toLocaleString('id-ID') }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  @click="resetForm"
                  :disabled="loading"
                  class="sm:w-auto"
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  :disabled="loading || !selectedItemsCount"
                  class="min-w-[140px] sm:w-auto"
                >
                  {{ loading ? 'Menyimpan...' : 'Simpan Sales Order' }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </CardContent>
  </Card>
</template>