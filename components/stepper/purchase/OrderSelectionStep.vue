<!-- components/stepper/purchase/OrderSelectionStep.vue -->
<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useSalesOrder } from '@/composables/useSalesOrder'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Calendar,
  DollarSign,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

// Props & Emits
interface Props {
  formData: any
  currentStep: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update', 'next', 'previous'])

// Composables
const { 
  salesOrders,
  loading,
  error,
  fetchIncomingOrders,
} = useSalesOrder()

// Local state
const searchQuery = ref('')
const statusFilter = ref('')
const selectedOrders = ref(new Set())
const sortBy = ref('orderDate')
const sortOrder = ref('desc')

// Initialize data
onMounted(async () => {
  await fetchIncomingOrders()
})

// Computed properties
const filteredOrders = computed(() => {
  let filtered = salesOrders.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.supplier.name.toLowerCase().includes(query) ||
      order.customer.email.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  // Sort orders
  filtered.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]
    
    if (sortBy.value === 'total') {
      aValue = parseFloat(aValue)
      bValue = parseFloat(bValue)
    }
    
    if (sortBy.value === 'orderDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    if (sortOrder.value === 'desc') {
      return bValue > aValue ? 1 : -1
    }
    return aValue > bValue ? 1 : -1
  })

  return filtered
})

const totalOrderValue = computed(() => {
  return filteredOrders.value.reduce((sum, order) => sum + parseFloat(order.total), 0)
})

const statusCounts = computed(() => {
  const counts = { pending: 0, approved: 0, completed: 0, cancelled: 0 }
  filteredOrders.value.forEach(order => {
    counts[order.status] = (counts[order.status] || 0) + 1
  })
  return counts
})

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

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(amount))
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

const getPriorityIndicator = (total: string) => {
  const amount = parseFloat(total)
  if (amount > 1000000) return 'high'
  if (amount > 500000) return 'medium'
  return 'low'
}

const toggleOrderSelection = (orderId: string) => {
  if (selectedOrders.value.has(orderId)) {
    selectedOrders.value.delete(orderId)
  } else {
    selectedOrders.value.add(orderId)
  }
}

const toggleAllOrders = () => {
  if (selectedOrders.value.size === filteredOrders.value.length) {
    selectedOrders.value.clear()
  } else {
    selectedOrders.value = new Set(filteredOrders.value.map(order => order.id))
  }
}

const handleRefresh = async () => {
  await fetchIncomingOrders()
  toast.success('Data pesanan telah diperbarui')
}

const handleExport = () => {
  toast.info('Fitur ekspor akan segera tersedia')
}

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

const handleNext = () => {
  if (selectedOrders.value.size === 0) {
    toast.error('Harap pilih minimal satu pesanan untuk diproses')
    return
  }
  
  const selectedOrderIds = Array.from(selectedOrders.value)
  emit('update', { selectedOrderIds })
  emit('next')
}

const handlePrevious = () => {
  emit('previous')
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  selectedOrders.value.clear()
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Package class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">Pilih Pesanan</h3>
          <p class="text-gray-600 mt-1">Pilih pesanan yang akan diproses untuk dijadikan sales order</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          @click="handleRefresh"
          :disabled="loading"
          class="flex items-center gap-2"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Segarkan
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="handleExport"
          class="flex items-center gap-2"
        >
          <Download class="w-4 h-4" />
          Ekspor
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Total Pesanan</p>
              <p class="text-2xl font-bold text-gray-900">{{ filteredOrders.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar class="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Menunggu</p>
              <p class="text-2xl font-bold text-yellow-600">{{ statusCounts.pending }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Disetujui</p>
              <p class="text-2xl font-bold text-green-600">{{ statusCounts.approved }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Total Nilai</p>
              <p class="text-lg font-bold text-blue-600">{{ formatCurrency(totalOrderValue.toString()) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filter Controls -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div class="flex items-center gap-2 flex-1">
            <Filter class="w-4 h-4 text-gray-500" />
            <span class="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 flex-1">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                v-model="searchQuery"
                placeholder="Cari nomor pesanan, pelanggan, atau supplier..."
                class="pl-10"
              />
            </div>
            
            <select
              v-model="statusFilter"
              class="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-w-[150px]"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            
            <Button 
              v-if="searchQuery || statusFilter"
              variant="outline" 
              size="sm"
              @click="clearFilters"
            >
              Hapus Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-lg font-medium text-gray-700">Memuat data pesanan...</p>
        <p class="text-sm text-gray-500">Mohon tunggu sebentar</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border bg-red-50 border-red-200 p-6">
      <div class="flex items-center gap-3">
        <AlertCircle class="w-6 h-6 text-red-600" />
        <div>
          <p class="text-lg font-semibold text-red-800">Gagal memuat data pesanan</p>
          <p class="text-sm text-red-600 mt-1">{{ error.message }}</p>
        </div>
      </div>
      <Button 
        @click="handleRefresh" 
        variant="outline" 
        size="sm"
        class="mt-4"
      >
        Coba Lagi
      </Button>
    </div>

    <!-- Orders Table -->
    <div v-else-if="filteredOrders.length > 0" class="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span>Daftar Pesanan Masuk</span>
              <Badge variant="outline" class="bg-blue-50 text-blue-700">
                {{ filteredOrders.length }} pesanan
              </Badge>
            </div>
            <div class="flex items-center gap-2">
              <Checkbox 
                :checked="selectedOrders.size === filteredOrders.length && filteredOrders.length > 0"
                @update:checked="toggleAllOrders"
              />
              <Label class="text-sm text-gray-600">
                Pilih Semua ({{ selectedOrders.size }})
              </Label>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-gray-50">
                  <TableHead class="w-12">
                    <Checkbox 
                      :checked="selectedOrders.size === filteredOrders.length && filteredOrders.length > 0"
                      @update:checked="toggleAllOrders"
                    />
                  </TableHead>
                  <TableHead 
                    class="cursor-pointer hover:bg-gray-100 transition-colors"
                    @click="handleSort('orderNumber')"
                  >
                    <div class="flex items-center gap-2">
                      Nomor Pesanan
                      <ChevronRight 
                        class="w-4 h-4 transition-transform"
                        :class="{ 'rotate-90': sortBy === 'orderNumber' && sortOrder === 'desc', 'rotate-180': sortBy === 'orderNumber' && sortOrder === 'asc' }"
                      />
                    </div>
                  </TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead 
                    class="cursor-pointer hover:bg-gray-100 transition-colors"
                    @click="handleSort('orderDate')"
                  >
                    <div class="flex items-center gap-2">
                      Tanggal
                      <ChevronRight 
                        class="w-4 h-4 transition-transform"
                        :class="{ 'rotate-90': sortBy === 'orderDate' && sortOrder === 'desc', 'rotate-180': sortBy === 'orderDate' && sortOrder === 'asc' }"
                      />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    class="text-right cursor-pointer hover:bg-gray-100 transition-colors"
                    @click="handleSort('total')"
                  >
                    <div class="flex items-center justify-end gap-2">
                      Total
                      <ChevronRight 
                        class="w-4 h-4 transition-transform"
                        :class="{ 'rotate-90': sortBy === 'total' && sortOrder === 'desc', 'rotate-180': sortBy === 'total' && sortOrder === 'asc' }"
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                <TableRow 
                  v-for="order in filteredOrders" 
                  :key="order.id"
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  :class="{ 'bg-blue-50': selectedOrders.has(order.id) }"
                  @click="toggleOrderSelection(order.id)"
                >
                  <!-- Checkbox -->
                  <TableCell @click.stop>
                    <Checkbox 
                      :checked="selectedOrders.has(order.id)"
                      @update:checked="toggleOrderSelection(order.id)"
                    />
                  </TableCell>

                  <!-- Order Number -->
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-2">
                      <span>{{ order.orderNumber }}</span>
                      <div 
                        v-if="getPriorityIndicator(order.total) === 'high'"
                        class="w-2 h-2 bg-red-500 rounded-full"
                        title="Nilai tinggi"
                      ></div>
                      <div 
                        v-else-if="getPriorityIndicator(order.total) === 'medium'"
                        class="w-2 h-2 bg-yellow-500 rounded-full"
                        title="Nilai sedang"
                      ></div>
                    </div>
                  </TableCell>

                  <!-- Customer -->
                  <TableCell>
                    <div class="space-y-1">
                      <p class="font-medium text-gray-900">{{ order.customer.name }}</p>
                      <p class="text-sm text-gray-500">{{ order.customer.email }}</p>
                    </div>
                  </TableCell>

                  <!-- Supplier -->
                  <TableCell>
                    <div class="space-y-1">
                      <p class="font-medium text-gray-900">{{ order.supplier.name }}</p>
                      <p class="text-sm text-gray-500">{{ order.supplier.supplier_code }}</p>
                    </div>
                  </TableCell>

                  <!-- Date -->
                  <TableCell>
                    <div class="text-sm">
                      {{ formatDate(order.orderDate) }}
                    </div>
                  </TableCell>

                  <!-- Status -->
                  <TableCell>
                    <Badge :class="getStatusBadgeClass(order.status)" class="border">
                      {{ getStatusText(order.status) }}
                    </Badge>
                  </TableCell>

                  <!-- Total -->
                  <TableCell class="text-right">
                    <div class="font-semibold text-gray-900">
                      {{ formatCurrency(order.total) }}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="flex flex-col items-center gap-6">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Package class="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <h4 class="text-xl font-semibold text-gray-900 mb-2">
            {{ searchQuery || statusFilter ? 'Pesanan Tidak Ditemukan' : 'Belum Ada Pesanan' }}
          </h4>
          <p class="text-gray-500 mb-6 max-w-md">
            {{ searchQuery || statusFilter 
                ? 'Coba gunakan kata kunci lain atau ubah filter yang diterapkan' 
                : 'Belum ada pesanan yang tersedia untuk diproses saat ini' 
            }}
          </p>
          <div class="flex gap-3 justify-center">
            <Button 
              v-if="searchQuery || statusFilter" 
              @click="clearFilters" 
              variant="outline"
            >
              Hapus Filter
            </Button>
            <Button @click="handleRefresh" variant="outline">
              Segarkan Data
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
      <Button 
        variant="outline" 
        @click="handlePrevious"
        class="flex items-center gap-2"
      >
        <ChevronLeft class="w-4 h-4" />
        Kembali
      </Button>

      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-500">
          Langkah {{ currentStep }} dari 5
        </div>
        <div v-if="selectedOrders.size > 0" class="text-sm text-blue-600 font-medium">
          {{ selectedOrders.size }} pesanan dipilih
        </div>
        <Button 
          @click="handleNext"
          :disabled="loading || selectedOrders.size === 0"
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
/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
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

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Priority indicators */
.priority-high {
  border-left: 4px solid #ef4444;
}

.priority-medium {
  border-left: 4px solid #f59e0b;
}

.priority-low {
  border-left: 4px solid #22c55e;
}
</style>