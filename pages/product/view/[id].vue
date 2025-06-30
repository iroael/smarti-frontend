<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Icon } from '#components'
import { useProducts } from '@/composables/useProducts'
import type { Product } from '@/components/product/data/schema'

const route = useRoute()
const router = useRouter()
const { getProductById } = useProducts()

const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'ID produk tidak valid'
    loading.value = false
    return
  }
  
  try {
    loading.value = true
    error.value = null
    product.value = await getProductById(id)
    if (!product.value) {
      error.value = 'Produk tidak ditemukan'
    }
  } catch (err) {
    console.error('Error fetching product:', err)
    error.value = 'Gagal memuat data produk'
  } finally {
    loading.value = false
  }
})

function formatCurrency(value: string | number | null | undefined): string {
  if (!value) return 'Rp 0'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return 'Rp 0'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numValue)
}

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 0) return '-'
  
  if (cleaned.startsWith('62')) {
    const formatted = `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
    return formatted.replace(/-$/g, '') // Remove trailing dash if no more digits
  }
  if (cleaned.startsWith('0')) {
    const formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
    return formatted.replace(/-$/g, '') // Remove trailing dash if no more digits
  }
  return phone
}

const stockStatus = computed(() => {
  if (!product.value) return { variant: 'outline' as const, text: '-', icon: 'i-lucide-package' }

  const stock = Number(product.value.stock) || 0
  if (stock <= 0) {
    return { variant: 'destructive' as const, text: 'Habis', icon: 'i-lucide-alert-triangle' }
  } else if (stock <= 5) {
    return { variant: 'outline' as const, text: 'Stok Rendah', icon: 'i-lucide-alert-circle' }
  } else if (stock <= 50) {
    return { variant: 'secondary' as const, text: 'Stok Normal', icon: 'i-lucide-check-circle' }
  } else {
    return { variant: 'outline' as const, text: 'Stok Tinggi', icon: 'i-lucide-trending-up' }
  }
})

const bundleStats = computed(() => {
  if (!product.value?.bundleItems?.length) return null

  const totalItems = product.value.bundleItems.length
  const totalValue = product.value.bundleItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.prices?.[0]?.h_jual_b || '0')
    const quantity = Number(item.quantity) || 0
    return sum + (quantity * price)
  }, 0)

  return { totalItems, totalValue }
})

const taxDetails = computed(() => {
  if (!product.value?.productTaxes?.length) return null

  const ppn = product.value.productTaxes.find(t => t.tax?.name?.toLowerCase().includes('ppn'))
  const pph = product.value.productTaxes.find(t => t.tax?.name?.toLowerCase().includes('pph'))
  const dppJual = Number(product.value.prices?.[0]?.dpp_jual || 0)

  return {
    ppn: ppn ? {
      name: ppn.tax.name,
      rate: Number(ppn.tax.rate) || 0,
      amount: (dppJual * (Number(ppn.tax.rate) || 0) / 100)
    } : null,
    pph: pph ? {
      name: pph.tax.name,
      rate: Number(pph.tax.rate) || 0,
      amount: (dppJual * (Number(pph.tax.rate) || 0) / 100)
    } : null
  }
})

const profitAnalysis = computed(() => {
  if (!product.value) return null

  const dppBeli = Number(product.value.prices?.[0]?.dpp_beli || 0)
  const dppJual = Number(product.value.prices?.[0]?.dpp_jual || 0)
  const hJual = Number(product.value.prices?.[0]?.h_jual_b || 0)

  const grossMargin = dppJual - dppBeli
  const marginPercentage = dppBeli > 0 ? (grossMargin / dppBeli * 100) : 0
  const totalTax = (taxDetails.value?.ppn?.amount || 0) + (taxDetails.value?.pph?.amount || 0)
  const netProfit = hJual - dppBeli - totalTax

  return {
    grossMargin,
    marginPercentage: marginPercentage.toFixed(2),
    netProfit,
  }
})

function goBack() {
  router.back()
}

function editProduct() {
  if (product.value) {
    router.push(`/products/${product.value.id}/edit`)
  }
}
</script>

<template>
  <div class="mx-auto p-6 space-y-8 bg-background min-h-screen">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Detail Produk</h1>
        <p class="text-muted-foreground text-lg">Informasi lengkap produk dan bundling</p>
      </div>
      
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="router.back()">
          <Icon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Button v-if="product" variant="default" size="sm">
          <Icon name="i-lucide-edit" class="w-4 h-4 mr-2" />
          Edit Produk
        </Button>
      </div>
    </div>


    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Icon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary" />
      <p class="text-muted-foreground text-lg">Memuat data produk...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Icon name="i-lucide-alert-circle" class="h-12 w-12 text-destructive" />
      <div class="text-center space-y-2">
        <h3 class="text-xl font-semibold">Terjadi Kesalahan</h3>
        <p class="text-muted-foreground">{{ error }}</p>
      </div>
      <Button variant="outline" @click="goBack">
        <Icon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
        Kembali ke Daftar Produk
      </Button>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="space-y-6">
      <!-- Main Product Info -->
      <Card class="border shadow-sm">
        <CardHeader class="pb-4">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle class="text-xl md:text-2xl font-bold flex items-center gap-3">
              <Icon name="i-lucide-package" class="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <span>{{ product.name }}</span>
              <Badge variant="secondary" class="text-xs">
                {{ product.product_code }}
              </Badge>
            </CardTitle>
            
            <div class="flex gap-2">
              <Badge 
                :variant="product.is_bundle ? 'default' : 'outline'" 
                class="text-xs px-2 py-0.5"
              >
                <Icon 
                  :name="product.is_bundle ? 'i-lucide-layers' : 'i-lucide-box'" 
                  class="w-3 h-3 mr-1" 
                />
                {{ product.is_bundle ? 'Bundle' : 'Single' }}
              </Badge>
              
              <Badge 
                :variant="stockStatus.variant" 
                class="text-xs px-2 py-0.5"
              >
                <Icon :name="stockStatus.icon" class="w-3 h-3 mr-1" />
                {{ stockStatus.text }} ({{ product.stock || 0 }})
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent class="space-y-6">
          <!-- Description -->
          <div class="space-y-3">
            <h3 class="text-base font-semibold flex items-center gap-2">
              <Icon name="i-lucide-file-text" class="w-4 h-4 text-primary" />
              Deskripsi Produk
            </h3>
            <p class="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
              {{ product.description || 'Tidak ada deskripsi tersedia untuk produk ini.' }}
            </p>
          </div>

          <Separator />

          <!-- Pricing Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border rounded-lg p-4 flex flex-col items-center">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="i-lucide-arrow-down-circle" class="w-5 h-5 text-blue-600" />
                <span class="text-sm font-medium text-blue-600">DPP Beli Vendor</span>
              </div>
              <p class="text-xl font-bold text-blue-700">
                {{ formatCurrency(product.prices?.[0]?.dpp_beli) }}
              </p>
            </div>
            
            <div class="border rounded-lg p-4 flex flex-col items-center">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="i-lucide-tag" class="w-5 h-5 text-green-600" />
                <span class="text-sm font-medium text-green-600">DPP Jual KSS</span>
              </div>
              <p class="text-xl font-bold text-green-700">
                {{ formatCurrency(product.prices?.[0]?.dpp_jual) }}
              </p>
            </div>
            
            <div class="border rounded-lg p-4 flex flex-col items-center bg-primary/5">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="i-lucide-trending-up" class="w-5 h-5 text-primary" />
                <span class="text-sm font-medium text-primary">Harga Jual PLNE</span>
              </div>
              <p class="text-2xl font-bold text-primary">
                {{ formatCurrency(product.prices?.[0]?.h_jual_b) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Supplier & Tax Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Supplier Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-building" class="w-5 h-5 text-primary" />
              Informasi Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-sm text-muted-foreground">Nama</p>
                  <p class="font-medium">{{ product.supplier?.name || '-' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm text-muted-foreground">Kode</p>
                  <p class="font-medium font-mono">{{ product.supplier?.supplier_code || '-' }}</p>
                </div>
              </div>
              
              <div class="space-y-1">
                <p class="text-sm text-muted-foreground">Alamat</p>
                <p class="font-medium">{{ product.supplier?.address || '-' }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-sm text-muted-foreground">Telepon</p>
                  <p class="font-medium">{{ formatPhone(product.supplier?.phone) }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm text-muted-foreground">Email</p>
                  <p class="font-medium">{{ product.supplier?.email || '-' }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Tax Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-receipt" class="w-5 h-5 text-primary" />
              Detail Pajak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="taxDetails" class="space-y-4">
              <div v-if="taxDetails.ppn" class="space-y-2">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <Icon name="i-lucide-badge-percent" class="w-4 h-4 text-purple-600" />
                    <span class="font-medium">{{ taxDetails.ppn.name }}</span>
                  </div>
                  <span class="font-bold">{{ taxDetails.ppn.rate }}%</span>
                </div>
                <div class="flex justify-between bg-purple-50 p-3 rounded-md">
                  <span class="text-sm text-purple-700">Jumlah PPN</span>
                  <span class="font-bold text-purple-800">{{ formatCurrency(taxDetails.ppn.amount) }}</span>
                </div>
              </div>
              
              <div v-if="taxDetails.pph" class="space-y-2">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <Icon name="i-lucide-badge-percent" class="w-4 h-4 text-blue-600" />
                    <span class="font-medium">{{ taxDetails.pph.name }}</span>
                  </div>
                  <span class="font-bold">{{ taxDetails.pph.rate }}%</span>
                </div>
                <div class="flex justify-between bg-blue-50 p-3 rounded-md">
                  <span class="text-sm text-blue-700">Jumlah PPh</span>
                  <span class="font-bold text-blue-800">{{ formatCurrency(taxDetails.pph.amount) }}</span>
                </div>
              </div>
              
              <div v-if="taxDetails.ppn || taxDetails.pph">
                <Separator />
                
                <div class="flex justify-between items-center font-bold">
                  <span>Total Pajak</span>
                  <span class="text-lg">
                    {{ formatCurrency((taxDetails?.ppn?.amount || 0) + (taxDetails?.pph?.amount || 0)) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted-foreground py-8">
              <Icon name="i-lucide-file-x" class="w-8 h-8 mx-auto mb-2" />
              <p>Tidak ada data pajak tersedia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Profit Analysis -->
      <Card v-if="profitAnalysis">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="i-lucide-line-chart" class="w-5 h-5 text-primary" />
            Analisis Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="i-lucide-arrow-up-down" class="w-4 h-4 text-green-600" />
                <span class="text-sm font-medium">Margin Kotor</span>
              </div>
              <p class="text-xl font-bold text-green-700">
                {{ formatCurrency(profitAnalysis.grossMargin) }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                ({{ profitAnalysis.marginPercentage }}% dari DPP Beli)
              </p>
            </div>
            
            <div class="border rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="i-lucide-badge-percent" class="w-4 h-4 text-purple-600" />
                <span class="text-sm font-medium">Total Pajak</span>
              </div>
              <p class="text-xl font-bold text-purple-700">
                {{ formatCurrency((taxDetails?.ppn?.amount || 0) + (taxDetails?.pph?.amount || 0)) }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                (PPN + PPh)
              </p>
            </div>
            
            <div class="border rounded-lg p-4 bg-green-50">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="i-lucide-wallet" class="w-4 h-4 text-primary" />
                <span class="text-sm font-medium">Profit Bersih</span>
              </div>
              <p class="text-2xl font-bold text-primary">
                {{ formatCurrency(profitAnalysis.netProfit) }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                (Setelah pajak)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Bundle Items -->
      <Card v-if="product.is_bundle && product.bundleItems?.length">
        <CardHeader>
          <div class="flex justify-between items-center">
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-layers" class="w-5 h-5 text-primary" />
              Item Bundling
            </CardTitle>
            
            <div v-if="bundleStats" class="flex gap-2">
              <Badge variant="outline" class="px-2 py-0.5 text-xs">
                {{ bundleStats.totalItems }} items
              </Badge>
              <Badge variant="secondary" class="px-2 py-0.5 text-xs">
                Total: {{ formatCurrency(bundleStats.totalValue) }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div class="border rounded-lg overflow-hidden">
            <div class="grid grid-cols-12 bg-muted/50 p-2 border-b text-xs">
              <div class="col-span-1 font-medium text-muted-foreground">#</div>
              <div class="col-span-4 font-medium text-muted-foreground">Produk</div>
              <div class="col-span-2 font-medium text-muted-foreground text-center">Qty</div>
              <div class="col-span-2 font-medium text-muted-foreground text-right">DPP Beli</div>
              <div class="col-span-3 font-medium text-muted-foreground text-right">Harga Jual</div>
            </div>
            
            <div v-for="(item, i) in product.bundleItems" :key="item.id || i" class="grid grid-cols-12 p-2 border-b hover:bg-muted/30">
              <div class="col-span-1 text-sm font-medium">{{ i + 1 }}</div>
              <div class="col-span-4">
                <div class="flex items-center gap-2">
                  <Icon name="i-lucide-box" class="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p class="font-medium text-sm">
                      {{ item.product?.name || 'Unknown Product' }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ item.product?.product_code || '-' }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-span-2 flex justify-center">
                <Badge variant="outline" class="px-2 py-0.5 text-xs">
                  {{ item.quantity || 0 }}x
                </Badge>
              </div>
              <div class="col-span-2 text-right text-sm font-medium">
                {{ formatCurrency(item.product?.prices?.[0]?.dpp_beli) }}
              </div>
              <div class="col-span-3 text-right">
                <p class="text-sm font-bold">{{ formatCurrency(item.product?.prices?.[0]?.h_jual_b) }}</p>
                <p class="text-xs text-muted-foreground">
                  Stok: <Badge :variant="Number(item.product?.stock || 0) <= 5 ? 'destructive' : 'outline'" class="px-1 py-0 text-xs">
                    {{ item.product?.stock || 0 }}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Not Found State -->
    <div v-else class="flex flex-col items-center justify-center py-20 space-y-4">
      <Icon name="i-lucide-package-x" class="h-12 w-12 text-muted-foreground" />
      <div class="text-center space-y-2">
        <h3 class="text-xl font-semibold">Produk Tidak Ditemukan</h3>
        <p class="text-muted-foreground">Produk yang Anda cari tidak dapat ditemukan atau telah dihapus.</p>
      </div>
      <Button variant="outline" @click="goBack">
        <Icon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
        Kembali ke Daftar Produk
      </Button>
    </div>
  </div>
</template> 