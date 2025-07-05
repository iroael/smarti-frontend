<!-- components/stepper/purchase/PurchaseOrderSummary.vue -->
<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
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
  Trash2,
  Plus,
  ShoppingCart,
  DollarSign,
  Percent,
  Calculator,
  Eye,
  Download,
  Share2,
  Star,
  MessageCircle,
  Settings
} from 'lucide-vue-next'
import { computed, ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'

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
const showVoucherDialog = ref(false)
const showAddressDialog = ref(false)
const showPaymentDialog = ref(false)
const selectedPaymentMethod = ref('bank_transfer')
const estimatedDelivery = ref('3-5 hari kerja')
const selectedAddress = ref(null)

// Mock data - replace with actual data from props
const mockData = ref({
  selectedOrders: [
    {
      id: 1,
      orderNumber: 'SO-20250703-1751508351',
      supplier: {
        name: 'PT PLNE',
        code: 'SUP250005',
        rating: 4.8,
        location: 'Jakarta Pusat',
        verified: true
      },
      items: [
        {
          id: 1,
          name: 'Laptop ASUS ROG Strix G15',
          sku: 'ASU-ROG-G15-001',
          quantity: 2,
          price: 15000000,
          weight: 2.5,
          image: '/api/placeholder/80/80',
          specifications: ['AMD Ryzen 7', '16GB RAM', '512GB SSD'],
          warranty: '2 tahun'
        },
        {
          id: 2,
          name: 'Mouse Gaming Razer DeathAdder V3',
          sku: 'RZR-DA-V3-001',
          quantity: 5,
          price: 850000,
          weight: 0.3,
          image: '/api/placeholder/80/80',
          specifications: ['30,000 DPI', 'Wireless', '90 hours battery'],
          warranty: '1 tahun'
        }
      ],
      subtotal: 34250000,
      tax: 3425000,
      shippingCost: 150000,
      total: 37825000,
      status: 'pending'
    },
    {
      id: 2,
      orderNumber: 'SO-20250703-1751508332',
      supplier: {
        name: 'PT PLNE',
        code: 'SUP250005',
        rating: 4.8,
        location: 'Jakarta Pusat',
        verified: true
      },
      items: [
        {
          id: 3,
          name: 'Keyboard Mechanical Logitech G Pro X',
          sku: 'LOG-GPX-001',
          quantity: 3,
          price: 1200000,
          weight: 1.2,
          image: '/api/placeholder/80/80',
          specifications: ['Cherry MX switches', 'RGB lighting', 'Compact design'],
          warranty: '2 tahun'
        }
      ],
      subtotal: 3600000,
      tax: 360000,
      shippingCost: 75000,
      total: 4035000,
      status: 'pending'
    }
  ],
  shippingAddress: {
    name: 'PT SMARTLI Indonesia',
    address: 'Jl. Sudirman No. 123, Blok A',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    phone: '+62 21 1234 5678',
    contact: 'Budi Santoso'
  },
  paymentMethods: [
    { id: 'bank_transfer', name: 'Transfer Bank', fee: 0, icon: 'CreditCard' },
    { id: 'credit_card', name: 'Kartu Kredit', fee: 25000, icon: 'CreditCard' },
    { id: 'digital_wallet', name: 'E-Wallet', fee: 5000, icon: 'Phone' },
    { id: 'cod', name: 'Cash on Delivery', fee: 10000, icon: 'Truck' }
  ],
  vouchers: [
    { id: 1, code: 'NEWCUST10', discount: 10, type: 'percentage', minOrder: 1000000 },
    { id: 2, code: 'SAVE50K', discount: 50000, type: 'fixed', minOrder: 500000 }
  ]
})

// Computed properties
const totalItems = computed(() => {
  return mockData.value.selectedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
  }, 0)
})

const totalWeight = computed(() => {
  return mockData.value.selectedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity * item.weight), 0)
  }, 0)
})

const subtotalAmount = computed(() => {
  return mockData.value.selectedOrders.reduce((sum, order) => sum + order.subtotal, 0)
})

const totalTax = computed(() => {
  return mockData.value.selectedOrders.reduce((sum, order) => sum + order.tax, 0)
})

const totalShipping = computed(() => {
  let shipping = mockData.value.selectedOrders.reduce((sum, order) => sum + order.shippingCost, 0)
  if (expeditedShipping.value) {
    shipping += 100000 // Additional fee for expedited shipping
  }
  return shipping
})

const paymentFee = computed(() => {
  const method = mockData.value.paymentMethods.find(m => m.id === selectedPaymentMethod.value)
  return method ? method.fee : 0
})

const voucherDiscount = computed(() => {
  if (!voucherCode.value) return 0
  const voucher = mockData.value.vouchers.find(v => v.code === voucherCode.value)
  if (!voucher) return 0
  
  if (voucher.type === 'percentage') {
    return Math.min(subtotalAmount.value * (voucher.discount / 100), 100000)
  }
  return voucher.discount
})

const grandTotal = computed(() => {
  return subtotalAmount.value + totalTax.value + totalShipping.value + paymentFee.value - voucherDiscount.value
})

const estimatedDeliveryDate = computed(() => {
  const today = new Date()
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + (expeditedShipping.value ? 1 : 5))
  return deliveryDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const applyVoucher = () => {
  const voucher = mockData.value.vouchers.find(v => v.code === voucherCode.value)
  if (!voucher) {
    toast.error('Kode voucher tidak valid')
    return
  }
  
  if (subtotalAmount.value < voucher.minOrder) {
    toast.error(`Minimal pembelian ${formatCurrency(voucher.minOrder)} untuk voucher ini`)
    return
  }
  
  toast.success(`Voucher berhasil diterapkan! Hemat ${formatCurrency(voucherDiscount.value)}`)
  showVoucherDialog.value = false
}

const removeVoucher = () => {
  voucherCode.value = ''
  toast.success('Voucher dihapus')
}

const handleSubmit = () => {
  if (!notes.value.trim()) {
    toast.error('Mohon tambahkan catatan pesanan')
    return
  }
  
  const orderData = {
    selectedOrders: mockData.value.selectedOrders,
    shippingAddress: mockData.value.shippingAddress,
    paymentMethod: selectedPaymentMethod.value,
    notes: notes.value,
    expeditedShipping: expeditedShipping.value,
    requiresApproval: requiresApproval.value,
    voucherCode: voucherCode.value,
    summary: {
      subtotal: subtotalAmount.value,
      tax: totalTax.value,
      shipping: totalShipping.value,
      paymentFee: paymentFee.value,
      discount: voucherDiscount.value,
      grandTotal: grandTotal.value,
      totalItems: totalItems.value,
      totalWeight: totalWeight.value
    }
  }
  
  emit('submit', orderData)
  toast.success('Purchase Order berhasil dibuat!')
}

const handleNext = () => {
  handleSubmit()
}

const handlePrevious = () => {
  emit('previous')
}

const getSupplierBadge = (supplier) => {
  if (supplier.verified) {
    return { text: 'Terverifikasi', class: 'bg-green-100 text-green-800' }
  }
  return { text: 'Belum Terverifikasi', class: 'bg-yellow-100 text-yellow-800' }
}

const getDeliveryEstimate = (expedited) => {
  return expedited ? '1-2 hari kerja' : '3-5 hari kerja'
}

onMounted(() => {
  // Initialize with form data if available
  if (props.formData) {
    // Populate form with existing data
    console.log('Form data:', props.formData)
  }
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <CheckCircle class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">Ringkasan Pesanan</h3>
          <p class="text-gray-600 mt-1">Periksa kembali detail pesanan Anda sebelum mengirim</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="flex items-center gap-2">
          <Download class="w-4 h-4" />
          Unduh
        </Button>
        <Button variant="outline" size="sm" class="flex items-center gap-2">
          <Share2 class="w-4 h-4" />
          Bagikan
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Order Details -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Order Items by Supplier -->
        <div class="space-y-4">
          <div v-for="(order, index) in mockData.selectedOrders" :key="order.id">
            <Card class="overflow-hidden">
              <CardHeader class="bg-gray-50 pb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ order.supplier.name }}</h4>
                      <div class="flex items-center gap-2 mt-1">
                        <p class="text-sm text-gray-500">{{ order.supplier.code }}</p>
                        <Badge :class="getSupplierBadge(order.supplier).class" class="text-xs">
                          {{ getSupplierBadge(order.supplier).text }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="flex items-center gap-1">
                      <Star class="w-4 h-4 text-yellow-400 fill-current" />
                      <span class="text-sm font-medium">{{ order.supplier.rating }}</span>
                    </div>
                    <p class="text-xs text-gray-500">{{ order.supplier.location }}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent class="p-0">
                <div class="space-y-4 p-4">
                  <div v-for="item in order.items" :key="item.id" class="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex gap-4">
                      <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <Package class="w-8 h-8 text-gray-400" />
                      </div>
                      
                      <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                          <div>
                            <h5 class="font-medium text-gray-900 line-clamp-2">{{ item.name }}</h5>
                            <p class="text-sm text-gray-500">SKU: {{ item.sku }}</p>
                          </div>
                          <div class="text-right">
                            <p class="font-semibold text-gray-900">{{ formatCurrency(item.price) }}</p>
                            <p class="text-sm text-gray-500">per unit</p>
                          </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                              <span class="text-sm text-gray-600">Jumlah:</span>
                              <span class="font-medium">{{ item.quantity }} unit</span>
                            </div>
                            <div class="flex items-center gap-2">
                              <span class="text-sm text-gray-600">Berat:</span>
                              <span class="font-medium">{{ item.weight }} kg</span>
                            </div>
                          </div>
                          <div class="text-right">
                            <p class="font-semibold text-lg text-gray-900">
                              {{ formatCurrency(item.price * item.quantity) }}
                            </p>
                          </div>
                        </div>
                        
                        <div class="mt-3 pt-3 border-t">
                          <div class="flex flex-wrap gap-2">
                            <span v-for="spec in item.specifications" :key="spec" 
                                  class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {{ spec }}
                            </span>
                          </div>
                          <div class="flex justify-between items-center mt-2">
                            <span class="text-sm text-gray-600">Garansi: {{ item.warranty }}</span>
                            <Button variant="ghost" size="sm" class="text-blue-600 hover:text-blue-700">
                              <Eye class="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Order Summary -->
                <div class="bg-gray-50 p-4 border-t">
                  <div class="flex justify-between text-sm mb-2">
                    <span>Subtotal ({{ order.items.length }} produk)</span>
                    <span>{{ formatCurrency(order.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>Pajak (10%)</span>
                    <span>{{ formatCurrency(order.tax) }}</span>
                  </div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>Ongkos Kirim</span>
                    <span>{{ formatCurrency(order.shippingCost) }}</span>
                  </div>
                  <Separator class="my-2" />
                  <div class="flex justify-between font-semibold">
                    <span>Total Pesanan</span>
                    <span>{{ formatCurrency(order.total) }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Shipping Address -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <MapPin class="w-5 h-5" />
              Alamat Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-900">{{ mockData.shippingAddress.name }}</h4>
                <p class="text-gray-600 mt-1">{{ mockData.shippingAddress.address }}</p>
                <p class="text-gray-600">{{ mockData.shippingAddress.city }} {{ mockData.shippingAddress.postalCode }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <div class="flex items-center gap-2">
                    <Phone class="w-4 h-4 text-gray-400" />
                    <span class="text-sm">{{ mockData.shippingAddress.phone }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <User class="w-4 h-4 text-gray-400" />
                    <span class="text-sm">{{ mockData.shippingAddress.contact }}</span>
                  </div>
                </div>
              </div>
              <Dialog v-model:open="showAddressDialog">
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit class="w-4 h-4 mr-2" />
                    Ubah
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ubah Alamat Pengiriman</DialogTitle>
                  </DialogHeader>
                  <div class="space-y-4">
                    <div>
                      <Label>Nama Perusahaan</Label>
                      <Input v-model="mockData.shippingAddress.name" />
                    </div>
                    <div>
                      <Label>Alamat Lengkap</Label>
                      <Textarea v-model="mockData.shippingAddress.address" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Kota</Label>
                        <Input v-model="mockData.shippingAddress.city" />
                      </div>
                      <div>
                        <Label>Kode Pos</Label>
                        <Input v-model="mockData.shippingAddress.postalCode" />
                      </div>
                    </div>
                    <div>
                      <Label>Nomor Telepon</Label>
                      <Input v-model="mockData.shippingAddress.phone" />
                    </div>
                    <div>
                      <Label>Nama Kontak</Label>
                      <Input v-model="mockData.shippingAddress.contact" />
                    </div>
                    <Button @click="showAddressDialog = false" class="w-full">
                      Simpan Alamat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <!-- Delivery Options -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Truck class="w-5 h-5" />
              Opsi Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 class="font-medium">Pengiriman Standar</h4>
                    <p class="text-sm text-gray-500">Estimasi {{ getDeliveryEstimate(false) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold">{{ formatCurrency(totalShipping) }}</p>
                  <p class="text-sm text-gray-500">Total berat: {{ totalWeight }} kg</p>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-3">
                  <Switch v-model:checked="expeditedShipping" />
                  <div>
                    <h4 class="font-medium">Pengiriman Ekspres</h4>
                    <p class="text-sm text-gray-500">Estimasi 1-2 hari kerja (+Rp 100.000)</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-orange-600">+{{ formatCurrency(100000) }}</p>
                </div>
              </div>
              
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <Calendar class="w-4 h-4 text-blue-600" />
                  <span class="font-medium text-blue-900">Estimasi Tiba</span>
                </div>
                <p class="text-blue-800">{{ estimatedDeliveryDate }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Payment Method -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <CreditCard class="w-5 h-5" />
              Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div v-for="method in mockData.paymentMethods" :key="method.id" 
                   class="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                   :class="{ 'border-blue-500 bg-blue-50': selectedPaymentMethod === method.id }"
                   @click="selectedPaymentMethod = method.id">
                <div class="flex items-center gap-3">
                  <input type="radio" 
                         :checked="selectedPaymentMethod === method.id"
                         @change="selectedPaymentMethod = method.id"
                         class="text-blue-600" />
                  <div>
                    <h4 class="font-medium">{{ method.name }}</h4>
                    <p v-if="method.fee > 0" class="text-sm text-gray-500">
                      Biaya admin: {{ formatCurrency(method.fee) }}
                    </p>
                    <p v-else class="text-sm text-green-600">Gratis biaya admin</p>
                  </div>
                </div>
                <CreditCard class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Notes -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <MessageCircle class="w-5 h-5" />
              Catatan Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <Label for="notes">Catatan untuk Supplier</Label>
                <Textarea 
                  id="notes"
                  v-model="notes"
                  placeholder="Tambahkan catatan khusus untuk pesanan ini..."
                  class="min-h-[100px] mt-2"
                />
                <p class="text-sm text-gray-500 mt-2">
                  Catatan ini akan dikirim kepada supplier sebagai informasi tambahan
                </p>
              </div>
              
              <div class="flex items-center gap-3">
                <Switch v-model:checked="requiresApproval" />
                <div>
                  <Label>Memerlukan Persetujuan</Label>
                  <p class="text-sm text-gray-500">Pesanan ini memerlukan persetujuan atasan sebelum dikirim</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Order Summary -->
      <div class="space-y-6">
        
        <!-- Voucher Section -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Percent class="w-5 h-5" />
              Voucher & Promo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-if="voucherCode" class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p class="font-medium text-green-800">{{ voucherCode }}</p>
                  <p class="text-sm text-green-600">Hemat {{ formatCurrency(voucherDiscount) }}</p>
                </div>
                <Button variant="ghost" size="sm" @click="removeVoucher">
                  <Trash2 class="w-4 h-4 text-red-500" />
                </Button>
              </div>
              
              <Dialog v-model:open="showVoucherDialog">
                <DialogTrigger asChild>
                  <Button variant="outline" class="w-full">
                    <Plus class="w-4 h-4 mr-2" />
                    Gunakan Voucher
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pilih Voucher</DialogTitle>
                  </DialogHeader>
                  <div class="space-y-4">
                    <div>
                      <Label>Kode Voucher</Label>
                      <div class="flex gap-2 mt-2">
                        <Input v-model="voucherCode" placeholder="Masukkan kode voucher" />
                        <Button @click="applyVoucher">Terapkan</Button>
                      </div>
                    </div>
                    
                    <div class="space-y-3">
                      <h4 class="font-medium">Voucher Tersedia</h4>
                      <div v-for="voucher in mockData.vouchers" :key="voucher.id" 
                           class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                           @click="voucherCode = voucher.code">
                        <div class="flex justify-between items-start">
                          <div>
                            <p class="font-medium">{{ voucher.code }}</p>
                            <p class="text-sm text-gray-600">
                              {{ voucher.type === 'percentage' ? voucher.discount + '%' : formatCurrency(voucher.discount) }}
                              off
                            </p>
                            <p class="text-xs text-gray-500">
                              Min. pembelian {{ formatCurrency(voucher.minOrder) }}
                            </p>
                          </div>
                          <Badge variant="outline">{{ voucher.type === 'percentage' ? 'Persentase' : 'Nominal' }}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <!-- Order Summary -->
        <Card class="sticky top-6">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Calculator class="w-5 h-5" />
              Ringkasan Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Subtotal ({{ totalItems }} item)</span>
                <span class="font-medium">{{ formatCurrency(subtotalAmount) }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Pajak</span>
                <span class="font-medium">{{ formatCurrency(totalTax) }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Ongkos Kirim</span>
                <span class="font-medium">{{ formatCurrency(totalShipping) }}</span>
              </div>
              
              <div v-if="paymentFee > 0" class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Biaya Admin</span>
                <span class="font-medium">{{ formatCurrency(paymentFee) }}</span>
              </div>
              
              <div v-if="voucherDiscount > 0" class="flex justify-between items-center">
                <span class="text-sm text-green-600">Diskon Voucher</span>
                <span class="font-medium text-green-600">-{{ formatCurrency(voucherDiscount) }}</span>
              </div>
              
              <Separator class="my-3" />
              
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold">Total Pembayaran</span>
                <span class="text-xl font-bold text-blue-600">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Statistics -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Info class="w-5 h-5" />
              Statistik Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ totalItems }}</div>
                <div class="text-sm text-blue-800">Total Item</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ mockData.selectedOrders.length }}</div>
                <div class="text-sm text-green-800">Supplier</div>
              </div>
              <div class="text-center p-3 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">{{ totalWeight }}</div>
                <div class="text-sm text-orange-800">Total Berat (kg)</div>
              </div>
              <div class="text-center p-3 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ expeditedShipping ? 1 : 5 }}</div>
                <div class="text-sm text-purple-800">Hari Pengiriman</div>
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
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between items-center pt-6 border-t">
      <Button variant="outline" @click="handlePrevious" class="flex items-center gap-2">
        <ChevronLeft class="w-4 h-4" />
        Kembali
      </Button>
      
      <div class="flex items-center gap-3">
        <Button variant="outline" class="flex items-center gap-2">
          <Eye class="w-4 h-4" />
          Preview
        </Button>
        <Button @click="handleNext" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          Buat Purchase Order
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>