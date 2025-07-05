<!-- components/stepper/ProductSelectionStep.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart,
  Package,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  AlertCircle,
  Search,
  Filter,
  Check,
  X
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useProducts } from '@/composables/useProducts'

// Props & Emits
interface Props {
  formData: any
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous'])

// Composables
const { fetchProductsByRole, bundleProducts } = useProducts()

// Local state
const loading = ref(false)
const searchQuery = ref('')
const selectedItems = ref(props.formData.selectedItems || [])
const includePPN = ref(props.formData.includePPN ?? true)

// Constants
const PPN_RATE = 0.11 // 11%

// Computed
const filteredProducts = computed(() => {
  if (!bundleProducts.value) return []
  
  return bundleProducts.value.filter(product => {
    const searchTerm = searchQuery.value.toLowerCase()
    return (
      product.name?.toLowerCase().includes(searchTerm) ||
      product.code?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    )
  })
})

const selectedItemsCount = computed(() => selectedItems.value.length)

const totalQuantity = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const subtotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    const price = getProductPrice(item.productId)
    return sum + (price * item.quantity)
  }, 0)
})

const ppnAmount = computed(() => 
  includePPN.value ? subtotal.value * PPN_RATE : 0
)

const total = computed(() => subtotal.value + ppnAmount.value)

const isFormValid = computed(() => {
  return selectedItems.value.length > 0 && 
         selectedItems.value.every(item => item.quantity > 0)
})

// Helper functions
const getProductPrice = (productId: number): number => {
  const product = bundleProducts.value?.find(p => p.id === productId)
  const price = parseFloat(product?.prices?.[0]?.h_jual_b || '0')
  return price
}

const getStockStatus = (stock: number) => {
  if (stock === 0)
    return { label: 'Habis', variant: 'destructive', class: 'bg-red-100 text-red-700 border-red-200' }
  if (stock <= 5)
    return { label: 'Terbatas', variant: 'warning', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  return { label: 'Tersedia', variant: 'success', class: 'bg-green-100 text-green-700 border-green-200' }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Item management functions
const isChecked = (productId: number) => 
  selectedItems.value.some(i => i.productId === productId)

const getQuantity = (productId: number) => 
  selectedItems.value.find(i => i.productId === productId)?.quantity || 1

const toggleItem = (productId: number, checked: boolean) => {
  const product = bundleProducts.value?.find(p => p.id === productId)
  if (!product) return

  const idx = selectedItems.value.findIndex(i => i.productId === productId)
  
  if (checked && idx === -1) {
    if (product.stock > 0) {
      selectedItems.value.push({ productId, quantity: 1 })
      toast.success(`${product.name} ditambahkan ke keranjang`)
    } else {
      toast.error('Produk tidak tersedia')
    }
  } else if (!checked && idx !== -1) {
    selectedItems.value.splice(idx, 1)
    toast.success(`${product.name} dihapus dari keranjang`)
  }
}

const updateQuantity = (productId: number, value: number) => {
  const item = selectedItems.value.find(i => i.productId === productId)
  const product = bundleProducts.value?.find(p => p.id === productId)
  
  if (item && product) {
    const newQuantity = Math.max(1, Math.min(value, product.stock))
    
    if (newQuantity !== item.quantity) {
      item.quantity = newQuantity
      
      if (newQuantity === product.stock && value > product.stock) {
        toast.warning(`Maksimal ${product.stock} unit tersedia`)
      }
    }
  }
}

const incrementQuantity = (productId: number) => {
  const currentQty = getQuantity(productId)
  updateQuantity(productId, currentQty + 1)
}

const decrementQuantity = (productId: number) => {
  const currentQty = getQuantity(productId)
  if (currentQty > 1) {
    updateQuantity(productId, currentQty - 1)
  }
}

const removeItem = (productId: number) => {
  const idx = selectedItems.value.findIndex(i => i.productId === productId)
  if (idx !== -1) {
    const product = bundleProducts.value?.find(p => p.id === productId)
    selectedItems.value.splice(idx, 1)
    toast.success(`${product?.name} dihapus dari keranjang`)
  }
}

const clearAll = () => {
  selectedItems.value = []
  toast.success('Keranjang dikosongkan')
}

// Navigation handlers
const handleNext = () => {
  if (!isFormValid.value) {
    toast.error('Harap pilih minimal satu produk')
    return
  }

  // Validate stock
  const stockErrors = []
  for (const item of selectedItems.value) {
    const product = bundleProducts.value?.find(p => p.id === item.productId)
    if (product && item.quantity > product.stock) {
      stockErrors.push(`${product.name}: stok tidak cukup (tersedia: ${product.stock})`)
    }
  }

  if (stockErrors.length > 0) {
    toast.error('Stok tidak mencukupi', {
      description: stockErrors.join(', ')
    })
    return
  }

  // Update parent form data
  emit('update', {
    selectedItems: selectedItems.value,
    includePPN: includePPN.value,
    subtotal: subtotal.value,
    ppnAmount: ppnAmount.value,
    total: total.value
  })

  // Proceed to next step
  emit('next', 3)
}

const handlePrevious = () => {
  emit('previous')
}

// Initialize data
const initializeData = async () => {
  loading.value = true
  try {
    await fetchProductsByRole()
    console.log('✅ Products loaded:', bundleProducts.value?.length || 0)
  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    toast.error('Gagal memuat data produk')
  } finally {
    loading.value = false
  }
}

// Watchers
watch(selectedItems, (newItems) => {
  console.log('🛒 Selected items changed:', newItems)
}, { deep: true })

// Initialize
onMounted(() => {
  initializeData()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Package class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">Pilih Produk</h3>
          <p class="text-sm text-gray-500">Pilih produk bundling untuk order ini</p>
        </div>
      </div>
      
      <!-- Cart Summary -->
      <div v-if="selectedItemsCount > 0" class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm text-gray-500">{{ selectedItemsCount }} produk dipilih</p>
          <p class="font-semibold text-gray-900">{{ formatCurrency(total) }}</p>
        </div>
        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center relative">
          <ShoppingCart class="w-5 h-5 text-green-600" />
          <Badge class="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-green-600">
            {{ totalQuantity }}
          </Badge>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-sm text-gray-500">Memuat produk...</p>
      </div>
    </div>

    <!-- Products Table -->
    <div v-else-if="filteredProducts.length > 0" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span>Daftar Produk Bundling</span>
            <Badge variant="outline">{{ filteredProducts.length }} produk</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12"></TableHead>
                <TableHead>Produk</TableHead>
                <TableHead class="text-right">Harga</TableHead>
                <TableHead class="text-center">Stok</TableHead>
                <TableHead class="text-center">Jumlah</TableHead>
                <TableHead class="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow 
                v-for="product in filteredProducts" 
                :key="product.id"
                :class="{ 'bg-blue-50': isChecked(product.id) }"
              >
                <!-- Checkbox -->
                <TableCell>
                  <Checkbox
                    :checked="isChecked(product.id)"
                    @update:checked="(checked) => toggleItem(product.id, checked)"
                    :disabled="product.stock === 0"
                  />
                </TableCell>

                <!-- Product Info -->
                <TableCell>
                  <div class="space-y-1">
                    <p class="font-medium text-gray-900">{{ product.name }}</p>
                    <p class="text-sm text-gray-500">{{ product.code }}</p>
                    <p v-if="product.description" class="text-xs text-gray-400 line-clamp-2">
                      {{ product.description }}
                    </p>
                  </div>
                </TableCell>

                <!-- Price -->
                <TableCell class="text-right">
                  <p class="font-medium">{{ formatCurrency(getProductPrice(product.id)) }}</p>
                </TableCell>

                <!-- Stock Status -->
                <TableCell class="text-center">
                  <div class="flex flex-col items-center gap-1">
                    <Badge 
                      variant="outline"
                      :class="getStockStatus(product.stock).class"
                    >
                      {{ getStockStatus(product.stock).label }}
                    </Badge>
                    <span class="text-xs text-gray-500">{{ product.stock }} unit</span>
                  </div>
                </TableCell>

                <!-- Quantity Controls -->
                <TableCell class="text-center">
                  <div v-if="isChecked(product.id)" class="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      @click="decrementQuantity(product.id)"
                      :disabled="getQuantity(product.id) <= 1"
                      class="h-8 w-8 p-0"
                    >
                      <Minus class="w-3 h-3" />
                    </Button>
                    
                    <Input
                      :model-value="getQuantity(product.id)"
                      @input="(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)"
                      type="number"
                      min="1"
                      :max="product.stock"
                      class="w-16 text-center h-8"
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      @click="incrementQuantity(product.id)"
                      :disabled="getQuantity(product.id) >= product.stock"
                      class="h-8 w-8 p-0"
                    >
                      <Plus class="w-3 h-3" />
                    </Button>
                  </div>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </TableCell>

                <!-- Subtotal -->
                <TableCell class="text-right">
                  <p v-if="isChecked(product.id)" class="font-medium">
                    {{ formatCurrency(getProductPrice(product.id) * getQuantity(product.id)) }}
                  </p>
                  <span v-else class="text-gray-400">-</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Selected Items Summary -->
      <div v-if="selectedItemsCount > 0" class="space-y-4">
        <!-- Selected Products Card -->
        <Card class="bg-blue-50 border-blue-200">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-sm font-medium text-blue-800 flex items-center gap-2">
                <ShoppingCart class="w-4 h-4" />
                Produk Terpilih ({{ selectedItemsCount }})
              </CardTitle>
              <Button variant="ghost" size="sm" @click="clearAll" class="text-blue-600 hover:text-blue-800">
                <X class="w-4 h-4 mr-1" />
                Kosongkan
              </Button>
            </div>
          </CardHeader>
          <CardContent class="pt-0">
            <div class="space-y-2">
              <div 
                v-for="item in selectedItems" 
                :key="item.productId"
                class="flex items-center justify-between py-2 px-3 bg-white rounded-lg border"
              >
                <div class="flex-1">
                  <p class="font-medium text-gray-900">
                    {{ bundleProducts?.find(p => p.id === item.productId)?.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ item.quantity }} × {{ formatCurrency(getProductPrice(item.productId)) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">
                    {{ formatCurrency(getProductPrice(item.productId) * item.quantity) }}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="removeItem(item.productId)"
                    class="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <X class="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Price Summary -->
        <Card>
          <CardContent class="p-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Subtotal ({{ totalQuantity }} item)</span>
                <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Checkbox
                    :checked="includePPN"
                    @update:checked="includePPN = $event"
                    id="ppn-checkbox"
                  />
                  <Label for="ppn-checkbox" class="text-gray-600 cursor-pointer">
                    PPN ({{ Math.round(PPN_RATE * 100) }}%)
                  </Label>
                </div>
                <span class="font-medium">{{ formatCurrency(ppnAmount) }}</span>
              </div>
              
              <Separator />
              
              <div class="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span class="text-green-600">{{ formatCurrency(total) }}</span>
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
          <Package class="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">
            {{ searchQuery ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk' }}
          </h4>
          <p class="text-gray-500 mb-4">
            {{ searchQuery ? 'Coba kata kunci lain' : 'Produk bundling belum tersedia' }}
          </p>
          <Button v-if="searchQuery" @click="searchQuery = ''" variant="outline">
            Tampilkan Semua Produk
          </Button>
        </div>
      </div>
    </div>

    <!-- Form Validation Alert -->
    <div v-if="!isFormValid && selectedItemsCount === 0" class="mt-4">
      <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle class="w-4 h-4 text-amber-600" />
        <p class="text-sm text-amber-700">Harap pilih minimal satu produk sebelum melanjutkan</p>
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
          :disabled="!isFormValid || loading"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Lanjutkan
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styling for better UX */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Loading animation */
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

/* Table row hover effects */
.table-row:hover {
  background-color: #f8fafc;
}

/* Badge animations */
.badge-animate {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .8;
  }
}
</style>