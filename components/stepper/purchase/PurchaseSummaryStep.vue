<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSalesOrder } from '@/composables/useSalesOrder'
import { 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  MapPin, 
  Clock, 
  CreditCard, 
  FileText, 
  Truck, 
  User, 
  Building, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Edit, 
  DollarSign, 
  Calculator, 
  Eye, 
  Download, 
  Share2, 
  Star, 
  MessageCircle, 
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'

// Props & Emits
interface Props {
  formData: any
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous', 'submit'])

// Local state
const notes = ref('')
const expeditedShipping = ref(false)
const requiresApproval = ref(false)
const voucherCode = ref('')
const voucherDiscount = ref(0)
const paymentFee = ref(0)
const selectedPaymentMethod = ref('bank_transfer')
const selectedOrdersData = ref([])
const isLoadingOrders = ref(false)
const expandedProducts = ref(new Set()) // Track which products are expanded

// Payment methods
const paymentMethods = [
  {
    value: 'bank_transfer',
    label: 'Transfer Bank',
    icon: CreditCard,
    fee: 'Rp 5.000'
  },
  {
    value: 'credit_card',
    label: 'Kartu Kredit',
    icon: CreditCard,
    fee: '2.5%'
  },
  {
    value: 'ewallet',
    label: 'E-Wallet',
    icon: Phone,
    fee: 'Rp 2.500'
  }
]

// Composables untuk data order
const { salesOrders, getSalesOrderById } = useSalesOrder()

// Computed properties
const selectedOrders = computed(() => {
  console.log('=== selectedOrders computed ===')
  console.log('selectedOrdersData:', selectedOrdersData.value)
  
  return selectedOrdersData.value
})

const totalItems = computed(() => {
  return selectedOrders.value.reduce((sum, order) => {
    return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0)
  }, 0)
})

const totalWeight = computed(() => {
  return selectedOrders.value.reduce((sum, order) => {
    return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity * item.weight), 0) || 0)
  }, 0)
})

const subtotalAmount = computed(() => {
  return selectedOrders.value.reduce((sum, order) => {
    const itemsSubtotal = order.items?.reduce((itemSum, item) => {
      const dppJual = Number(item.product?.prices?.[0]?.dpp_jual || 0);
      const quantity = Number(item.quantity || 0);
      return itemSum + (dppJual * quantity);
    }, 0) || 0;

    return sum + itemsSubtotal;
  }, 0);
})

const totalTax = computed(() => {
  return selectedOrders.value.reduce((sum, order) => {
    if (order.tax) {
      return sum + parseFloat(order.tax.toString())
    }
    const orderSubtotal = order.subtotal || 
      (order.items?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0)
    return sum + (orderSubtotal * 0.1)
  }, 0)
})

const totalShipping = computed(() => {
  let shipping = selectedOrders.value.reduce((sum, order) => {
    return sum + (parseFloat(order.shippingCost?.toString() || '0'))
  }, 0)
  
  if (expeditedShipping.value) {
    shipping += 100000
  }
  
  return shipping
})

const grandTotal = computed(() => {
  return subtotalAmount.value + totalTax.value + totalShipping.value + paymentFee.value
})

// New computed property for grouped products by supplier
const ordersBySupplier = computed(() => {
  if (!selectedOrders.value || selectedOrders.value.length === 0) {
    return []
  }
  
  const grouped = new Map()
  
  selectedOrders.value.forEach(order => {
    const supplierId = order.supplier?.id || 'unknown'
    
    if (!grouped.has(supplierId)) {
      grouped.set(supplierId, {
        supplier: order.supplier,
        orders: [],
        totalAmount: 0,
        totalItems: 0,
        groupedProducts: new Map() // Add grouped products
      })
    }
    
    const group = grouped.get(supplierId)
    group.orders.push(order)
    group.totalAmount += parseFloat(order.total?.toString() || '0')
    group.totalItems += order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    
    // Group products by product code
    order.items?.forEach(item => {
      const productCode = item.product.product_code
      const price = item.product.prices?.[0]?.dpp_jual || 0
      
      if (!group.groupedProducts.has(productCode)) {
        group.groupedProducts.set(productCode, {
          product: item.product,
          totalQuantity: 0,
          totalAmount: 0,
          price: price,
          orderDetails: [] // Store order details for this product
        })
      }
      
      const groupedProduct = group.groupedProducts.get(productCode)
      groupedProduct.totalQuantity += item.quantity
      groupedProduct.totalAmount += item.quantity * price
      groupedProduct.orderDetails.push({
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        quantity: item.quantity,
        amount: item.quantity * price
      })
    })
  })
  
  // Convert Map to Array for easier template iteration
  return Array.from(grouped.values()).map(group => ({
    ...group,
    groupedProducts: Array.from(group.groupedProducts.values())
  }))
})

// Methods
const loadSelectedOrders = async () => {
  console.log('=== loadSelectedOrders ===')
  
  if (!props.formData?.selectedOrderIds || props.formData.selectedOrderIds.length === 0) {
    console.log('No selectedOrderIds to load')
    selectedOrdersData.value = []
    return
  }
  
  isLoadingOrders.value = true
  const orderPromises = props.formData.selectedOrderIds.map(async (orderId) => {
    console.log('Loading order:', orderId)
    try {
      const order = await getSalesOrderById(orderId)
      console.log('Loaded order:', order)
      return order
    } catch (error) {
      console.error('Error loading order:', orderId, error)
      return null
    }
  })
  
  try {
    const orders = await Promise.all(orderPromises)
    selectedOrdersData.value = orders.filter(order => order !== null)
    console.log('All orders loaded:', selectedOrdersData.value)
  } catch (error) {
    console.error('Error loading orders:', error)
    alert('Gagal memuat detail pesanan')
  } finally {
    isLoadingOrders.value = false
  }
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numAmount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSupplierBadge = (supplier: any) => {
  if (supplier?.verified) {
    return { text: 'Terverifikasi', class: 'bg-green-100 text-green-800' }
  }
  return { text: 'Belum Terverifikasi', class: 'bg-yellow-100 text-yellow-800' }
}

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Menunggu'
    case 'approved':
      return 'Disetujui'
    case 'completed':
      return 'Selesai'
    case 'cancelled':
      return 'Dibatalkan'
    default:
      return status
  }
}

// New method to toggle product expansion
const toggleProductExpansion = (productCode: string) => {
  if (expandedProducts.value.has(productCode)) {
    expandedProducts.value.delete(productCode)
  } else {
    expandedProducts.value.add(productCode)
  }
}

const isProductExpanded = (productCode: string) => {
  return expandedProducts.value.has(productCode)
}

const removeVoucher = () => {
  voucherCode.value = ''
  voucherDiscount.value = 0
  alert('Voucher telah dihapus')
}

const updatePaymentFee = (method: string) => {
  const baseAmount = subtotalAmount.value + totalTax.value + totalShipping.value
  
  switch (method) {
    case 'credit_card':
      paymentFee.value = baseAmount * 0.025
      break
    case 'bank_transfer':
      paymentFee.value = 5000
      break
    case 'ewallet':
      paymentFee.value = 2500
      break
    default:
      paymentFee.value = 0
  }
}

const handleSubmit = () => {
  if (!notes.value.trim()) {
    alert('Mohon tambahkan catatan pesanan')
    return
  }
  
  if (selectedOrders.value.length === 0) {
    alert('Tidak ada pesanan yang dipilih')
    return
  }
  
  const orderData = {
    selectedOrderIds: props.formData.selectedOrderIds,
    selectedOrders: selectedOrders.value,
    paymentMethod: selectedPaymentMethod.value,
    notes: notes.value,
    expeditedShipping: expeditedShipping.value,
    requiresApproval: requiresApproval.value,
    summary: {
      subtotal: subtotalAmount.value,
      tax: totalTax.value,
      shipping: totalShipping.value,
      paymentFee: paymentFee.value,
      grandTotal: grandTotal.value,
      totalItems: totalItems.value,
      totalWeight: totalWeight.value
    },
    createdAt: new Date().toISOString(),
    ordersBySupplier: ordersBySupplier.value
  }

  emit('submit', orderData)
  alert('Purchase Order berhasil dibuat!')
}

const handleNext = () => {
  handleSubmit()
}

const handlePrevious = () => {
  emit('previous')
}

watch(() => props.formData, (newFormData) => {
  console.log('Form data changed:', newFormData)
  if (newFormData?.selectedOrderIds) {
    loadSelectedOrders()
  }
}, { deep: true })

watch(() => props.formData?.selectedOrderIds, (newIds) => {
  console.log('Selected order IDs changed:', newIds)
  if (newIds && newIds.length > 0) {
    loadSelectedOrders()
  }
}, { immediate: true })

// Initialize
onMounted(async () => {
  console.log('=== PurchaseSummaryStep Debug ===')
  console.log('Props received:', props)
  console.log('FormData:', props.formData)
  console.log('CurrentStep:', props.currentStep)
  
  if (props.formData?.selectedOrderIds && props.formData.selectedOrderIds.length > 0) {
    console.log('Loading selected orders...')
    await loadSelectedOrders()
  }
  
  if (props.formData) {
    if (props.formData.notes) notes.value = props.formData.notes
    if (props.formData.expeditedShipping) expeditedShipping.value = props.formData.expeditedShipping
    if (props.formData.requiresApproval) requiresApproval.value = props.formData.requiresApproval
    if (props.formData.paymentMethod) selectedPaymentMethod.value = props.formData.paymentMethod
  }
  
  updatePaymentFee(selectedPaymentMethod.value)
  console.log('=== End Debug ===')
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Ringkasan Purchase Order</h1>
          <p class="text-sm text-gray-500">Langkah {{ currentStep }} dari 3</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Loading State -->
        <div v-if="isLoadingOrders" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Memuat detail pesanan...</span>
        </div>

        <!-- Selected Orders by Supplier with Grouped Products -->
        <div v-else-if="selectedOrders.length > 0">
          <Card v-for="supplierGroup in ordersBySupplier" :key="supplierGroup.supplier?.id" class="mb-4">
            <CardHeader class="pb-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle class="text-lg">{{ supplierGroup.supplier?.name || 'Supplier Tidak Diketahui' }}</CardTitle>
                    <p class="text-sm text-gray-500">{{ supplierGroup.supplier?.supplier_code || 'Kode tidak tersedia' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 mt-1">
                    {{ supplierGroup.orders.length }} pesanan
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div class="space-y-4">
                <!-- Grouped Products -->
                <div class="border rounded-lg p-4">
                  <h4 class="font-medium mb-3 flex items-center">
                    <Package class="w-4 h-4 mr-2 text-gray-500" />
                    Produk yang Dipesan
                  </h4>
                  
                  <div class="space-y-2">
                    <div v-for="groupedProduct in supplierGroup.groupedProducts" :key="groupedProduct.product.product_code">
                      <!-- Main Product Row -->
                      <div 
                        @click="toggleProductExpansion(groupedProduct.product.product_code)"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Package class="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p class="font-medium">{{ groupedProduct.product.name }}</p>
                            <p class="text-sm text-gray-500">{{ groupedProduct.product.product_code }}</p>
                          </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                          <div class="text-right">
                            <p class="font-medium">{{ groupedProduct.totalQuantity }} x {{ formatCurrency(groupedProduct.price) }}</p>
                            <p class="text-sm text-gray-600">Total: {{ formatCurrency(groupedProduct.totalAmount) }}</p>
                          </div>
                          <div class="text-gray-400">
                            <ChevronDown v-if="!isProductExpanded(groupedProduct.product.product_code)" class="w-4 h-4" />
                            <ChevronUp v-else class="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      
                      <!-- Expanded Details -->
                      <div v-if="isProductExpanded(groupedProduct.product.product_code)" class="ml-6 mt-2 space-y-2">
                        <div class="text-sm text-gray-600 font-medium mb-2">Detail Pesanan:</div>
                        <div v-for="detail in groupedProduct.orderDetails" :key="detail.orderId" class="flex items-center justify-between p-2 bg-white rounded border">
                          <div class="flex items-center space-x-2">
                            <FileText class="w-3 h-3 text-gray-400" />
                            <span class="text-sm font-medium">{{ detail.orderNumber }}</span>
                          </div>
                          <div class="text-sm text-gray-600">
                            {{ detail.quantity }} x {{ formatCurrency(groupedProduct.price) }} = {{ formatCurrency(detail.amount) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <Package class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada pesanan dipilih</h3>
          <p class="text-gray-500">Silakan pilih pesanan terlebih dahulu</p>
        </div>

        <!-- Purchase Options -->
        <Card v-if="selectedOrders.length > 0">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Settings class="w-5 h-5" />
              <span>Pengaturan Pesanan</span>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Notes -->
            <div>
              <Label for="notes" class="text-sm font-medium">Catatan Pesanan *</Label>
              <Textarea
                id="notes"
                v-model="notes"
                placeholder="Tambahkan catatan khusus untuk pesanan ini..."
                class="mt-1"
                rows="3"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Summary Sidebar -->
      <div class="space-y-6">
        <!-- Order Summary -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Calculator class="w-5 h-5" />
              <span>Ringkasan Pesanan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Item</span>
                <span class="font-medium">{{ totalItems }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Berat</span>
                <span class="font-medium">{{ totalWeight.toFixed(1) }} kg</span>
              </div>
              <Separator />
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Subtotal</span>
                <span class="font-medium">{{ formatCurrency(subtotalAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Pajak (10%)</span>
                <span class="font-medium">{{ formatCurrency(totalTax) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Ongkos Kirim</span>
                <span class="font-medium">{{ formatCurrency(totalShipping) }}</span>
              </div>
              <div class="flex justify-between" v-if="paymentFee > 0">
                <span class="text-sm text-gray-600">Biaya Pembayaran</span>
                <span class="font-medium">{{ formatCurrency(paymentFee) }}</span>
              </div>
              <Separator />
              <div class="flex justify-between">
                <span class="font-semibold">Total</span>
                <span class="font-bold text-lg">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Important Notes -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 text-yellow-500" />
              Catatan Penting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Purchase Order akan dikirim ke supplier setelah konfirmasi pembayaran</p>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Pastikan alamat pengiriman sudah benar sebelum melanjutkan</p>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Waktu pengiriman dapat berubah tergantung kondisi cuaca dan lokasi</p>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Garansi produk berlaku sesuai dengan ketentuan masing-masing supplier</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button
            @click="handleNext"
            class="w-full"
            size="lg"
            :disabled="!notes.trim() || selectedOrders.length === 0"
          >
            <span>Buat Purchase Order</span>
            <ChevronRight class="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            @click="handlePrevious"
            class="w-full"
            size="lg"
          >
            Kembali ke Pemilihan
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>