<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Icon } from '#components'
import { useProducts } from '@/composables/useProducts'
import type { Product } from '@/types/schema'

const route = useRoute()
const router = useRouter()
const { getProductById } = useProducts()

const product = ref<Product | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  loading.value = true
  product.value = await getProductById(id)
  loading.value = false
})

function formatCurrency(value: string | number) {
  return parseFloat(value as string).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
  })
}

function formatPhone(phone: string) {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  }
  return phone
}

const stockStatus = computed(() => {
  if (!product.value) return { variant: 'outline', text: '-', icon: 'i-lucide-package' }
  
  const stock = Number(product.value.stock)
  if (stock <= 0) {
    return { variant: 'destructive', text: 'Habis', icon: 'i-lucide-alert-triangle' }
  } else if (stock <= 5) {
    return { variant: 'secondary', text: 'Stok Rendah', icon: 'i-lucide-alert-circle' }
  } else if (stock <= 50) {
    return { variant: 'default', text: 'Stok Normal', icon: 'i-lucide-check-circle' }
  } else {
    return { variant: 'outline', text: 'Stok Tinggi', icon: 'i-lucide-trending-up' }
  }
})

const bundleStats = computed(() => {
  if (!product.value?.bundleItems?.length) return null
  
  const totalItems = product.value.bundleItems.length
  // Use h_jual_b for subtotal calculation to match the table
  const totalValue = product.value.bundleItems.reduce((sum, item) => {
    return sum + (item.quantity * parseFloat(item.product.prices?.[0]?.h_jual_b || '0'))
  }, 0)
  
  return { totalItems, totalValue }
})
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

    <!-- Product Content -->
    <div v-else-if="product" class="space-y-6">
      <!-- Main Product Info -->
      <Card class="border-2 shadow-lg">
        <CardHeader class="pb-4">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle class="text-2xl font-bold flex items-center gap-3">
              <Icon name="i-lucide-package" class="w-6 h-6 text-primary" />
              {{ product.name }}
            </CardTitle>
            
            <div class="flex gap-2">
              <Badge 
                :variant="product.is_bundle ? 'default' : 'outline'" 
                class="text-sm px-3 py-1"
              >
                <Icon 
                  :name="product.is_bundle ? 'i-lucide-layers' : 'i-lucide-box'" 
                  class="w-3 h-3 mr-1" 
                />
                {{ product.is_bundle ? 'Bundle Product' : 'Single Product' }}
              </Badge>
              
              <Badge 
                :variant="stockStatus.variant" 
                class="text-sm px-3 py-1"
              >
                <Icon :name="stockStatus.icon" class="w-3 h-3 mr-1" />
                {{ stockStatus.text }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Kode Produk</p>
              <div class="flex items-center gap-2">
                <Icon name="i-lucide-hash" class="w-4 h-4 text-muted-foreground" />
                <p class="font-bold text-lg">{{ product.product_code }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Jumlah Stok</p>
              <div class="flex items-center gap-2">
                <Icon :name="stockStatus.icon" class="w-4 h-4" :class="{
                  'text-red-500': stockStatus.variant === 'destructive',
                  'text-yellow-500': stockStatus.variant === 'secondary',
                  'text-green-500': stockStatus.variant === 'default',
                  'text-blue-500': stockStatus.variant === 'outline'
                }" />
                <p class="font-bold text-lg">{{ product.stock }} unit</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Status</p>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <p class="font-medium text-green-700">Aktif</p>
              </div>
            </div>
          </div>

          <Separator />

          <!-- Description -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Icon name="i-lucide-file-text" class="w-5 h-5 text-primary" />
              Deskripsi Produk
            </h3>
            <p class="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
              {{ product.description || 'Tidak ada deskripsi tersedia untuk produk ini.' }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Supplier Information -->
      <Card class="shadow-md">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="i-lucide-building" class="w-5 h-5 text-primary" />
            Informasi Supplier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Icon name="i-lucide-user" class="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p class="text-sm text-muted-foreground">Nama Supplier</p>
                  <p class="font-semibold">{{ product.supplier?.name || '-' }}</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <Icon name="i-lucide-mail" class="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p class="text-sm text-muted-foreground">Email</p>
                  <p class="font-semibold">{{ product.supplier?.email || '-' }}</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Icon name="i-lucide-phone" class="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p class="text-sm text-muted-foreground">Telepon</p>
                  <p class="font-semibold">{{ formatPhone(product.supplier?.phone || '') }}</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <Icon name="i-lucide-map-pin" class="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p class="text-sm text-muted-foreground">Alamat</p>
                  <p class="font-semibold">{{ product.supplier?.address || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pricing Information -->
      <Card class="shadow-md">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="i-lucide-dollar-sign" class="w-5 h-5 text-primary" />
            Informasi Harga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Icon name="i-lucide-shopping-cart" class="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p class="text-sm text-blue-600 font-medium">DPP Beli Vendor</p>
              <p class="text-xl font-bold text-blue-700">
                {{ formatCurrency(product.prices?.[0]?.dpp_beli || 0) }}
              </p>
            </div>
            
            <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Icon name="i-lucide-tag" class="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p class="text-sm text-green-600 font-medium">DPP Jual KSS</p>
              <p class="text-xl font-bold text-green-700">
                {{ formatCurrency(product.prices?.[0]?.dpp_jual || 0) }}
              </p>
            </div>
            
            <div class="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Icon name="i-lucide-trending-up" class="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p class="text-sm text-purple-600 font-medium">Harga Jual PLNE</p>
              <p class="text-xl font-bold text-purple-700">
                {{ formatCurrency(product.prices?.[0]?.h_jual_b || 0) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Bundle Items -->
      <Card v-if="product.is_bundle && product.bundleItems?.length" class="shadow-md">
        <CardHeader>
          <div class="flex justify-between items-center">
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-layers" class="w-5 h-5 text-primary" />
              Item Bundling
            </CardTitle>
            
            <div v-if="bundleStats" class="flex gap-4 text-sm">
              <Badge variant="outline" class="px-3 py-1">
                {{ bundleStats.totalItems }} items
              </Badge>
              <Badge variant="secondary" class="px-3 py-1">
                Total: {{ formatCurrency(bundleStats.totalValue) }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b-2 border-muted">
                  <th class="text-left py-3 px-4 font-semibold text-muted-foreground">#</th>
                  <th class="text-left py-3 px-4 font-semibold text-muted-foreground">Nama Produk</th>
                  <th class="text-left py-3 px-4 font-semibold text-muted-foreground">Kode</th>
                  <th class="text-center py-3 px-4 font-semibold text-muted-foreground">Inventory Type</th>
                  <th class="text-center py-3 px-4 font-semibold text-muted-foreground">Qty</th>
                  <th class="text-right py-3 px-4 font-semibold text-muted-foreground">DPP Beli Vendor</th>
                  <th class="text-right py-3 px-4 font-semibold text-muted-foreground">DPP Jual KSS</th>
                  <th class="text-right py-3 px-4 font-semibold text-muted-foreground">Harga Jual PLNE</th>
                  <th class="text-center py-3 px-4 font-semibold text-muted-foreground">Stok</th>
                  <!-- <th class="text-right py-3 px-4 font-semibold text-muted-foreground">Subtotal</th> -->
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, i) in product.bundleItems"
                  :key="item.id"
                  class="border-b border-muted hover:bg-muted/30 transition-colors"
                >
                  <td class="py-4 px-4 text-sm font-medium">{{ i + 1 }}</td>
                  <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                      <Icon name="i-lucide-box" class="w-4 h-4 text-muted-foreground" />
                      <span class="font-medium">{{ item.product.name }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-sm text-muted-foreground font-mono">
                    {{ item.product.product_code }}
                  </td>
                  <td class="py-4 px-4 text-sm text-muted-foreground font-mono">
                    {{ item.product.inventory_type }}
                  </td>
                  <td class="py-4 px-4 text-center">
                    <Badge variant="outline" class="px-2 py-1">
                      {{ item.quantity }}x
                    </Badge>
                  </td>
                  <td class="py-4 px-4 text-right font-semibold">
                    {{ formatCurrency(item.product.prices?.[0]?.dpp_beli || 0) }}
                  </td>
                  <td class="py-4 px-4 text-right font-semibold">
                    {{ formatCurrency(item.product.prices?.[0]?.dpp_jual || 0) }}
                  </td>
                  <td class="py-4 px-4 text-right font-semibold">
                    {{ formatCurrency(item.product.prices?.[0]?.h_jual_b || 0) }}
                  </td>
                  <td class="py-4 px-4 text-center">
                    <Badge 
                      :variant="Number(item.product.stock) <= 5 ? 'destructive' : 'outline'"
                      class="px-2 py-1"
                    >
                      {{ item.product.stock }}
                    </Badge>
                  </td>
                  <!-- <td class="py-4 px-4 text-right font-bold">
                    {{ formatCurrency(item.quantity * parseFloat(item.product.prices?.[0]?.h_jual_b || '0')) }}
                  </td> -->
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-col items-center justify-center py-20 space-y-4">
      <Icon name="i-lucide-alert-circle" class="h-12 w-12 text-destructive" />
      <div class="text-center space-y-2">
        <h3 class="text-xl font-semibold">Produk Tidak Ditemukan</h3>
        <p class="text-muted-foreground">Produk yang Anda cari tidak dapat ditemukan atau telah dihapus.</p>
      </div>
      <Button variant="outline" @click="router.back()">
        <Icon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
        Kembali ke Daftar Produk
      </Button>
    </div>
  </div>
</template> 