<script setup lang="ts">
import type { Product } from '@/components/product/data/schema'

interface Props {
  product: Product
}

const props = defineProps<Props>()

// Format currency
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return 'Rp0'
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get bundle items count
const getBundleItemsCount = () => {
  const bundleItems = (props.product as any).bundle_items || (props.product as any).bundleItems
  return bundleItems?.length || 0
}

// Get selling price
const getPrice = () => {
  const product = props.product
  
  if ((product as any).prices && Array.isArray((product as any).prices)) {
    const prices = (product as any).prices
    if (prices.length > 0) {
      return parseFloat(prices[0].h_jual_b || prices[0].price || 0)
    }
  }
  
  if (product.price) {
    return typeof product.price === 'string' ? parseFloat(product.price) : product.price
  }
  
  return 0
}

// Get supplier name
const getSupplierName = () => {
  const product = props.product as any
  return product.supplier_name || product.supplier?.name || null
}

// Get product code
const getProductCode = () => {
  const product = props.product as any
  return product.product_code || product.sku || null
}

// Get bundle items for display
const getBundleItems = () => {
  const product = props.product as any
  return product.bundle_items || product.bundleItems || []
}

// Navigation to order page
const navigateToOrder = () => {
  navigateTo(`/sales-order/create?product_id=${props.product.id}`)
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Enhanced Header with Gradient -->
    <div class="h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      <!-- Main Package Icon with Animation -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative">
          <svg class="w-20 h-20 text-blue-500 drop-shadow-sm transform hover:scale-110 transition-transform duration-300" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 12l8-4"/>
          </svg>
          <!-- Pulse animation for bundle -->
          <div v-if="(product as any).is_bundle" 
               class="absolute inset-0 w-20 h-20 border-2 border-blue-400 rounded-full animate-ping opacity-20"></div>
        </div>
      </div>
      
      <!-- Enhanced Bundle Badge -->
      <div class="absolute top-4 left-4">
        <div v-if="(product as any).is_bundle" 
             class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg backdrop-blur-sm">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          Bundle
          <span v-if="getBundleItemsCount() > 0" 
                class="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
            {{ getBundleItemsCount() }}
          </span>
        </div>
        <div v-else 
             class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
          </svg>
          Product
        </div>
      </div>
      
      <!-- Product ID Badge -->
      <div class="absolute top-4 right-4">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono text-gray-600 bg-white/80 backdrop-blur-sm shadow-sm">
          #{{ product.id }}
        </span>
      </div>
    </div>
    
    <!-- Enhanced Content Section -->
    <div class="p-6">
      <!-- Product Title & Description -->
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {{ product.name }}
        </h1>
        <p class="text-gray-600 text-sm leading-relaxed">
          {{ product.description || 'Deskripsi produk tidak tersedia. Silakan hubungi tim sales untuk informasi lebih lanjut.' }}
        </p>
      </div>
      
      <!-- Enhanced Bundle Items Display -->
      <div v-if="(product as any).is_bundle && getBundleItems().length > 0" class="mb-6">
        <div class="flex items-center mb-3">
          <h3 class="text-sm font-semibold text-gray-700">Bundle Contents:</h3>
          <span class="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
            {{ getBundleItems().length }} items
          </span>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid gap-3">
            <div 
              v-for="(item, index) in getBundleItems().slice(0, 4)" 
              :key="item.id || index"
              class="flex items-center justify-between p-2 bg-white rounded-md shadow-sm border border-gray-100"
            >
              <div class="flex items-center flex-1">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 mr-3 flex-shrink-0">
                  {{ item.quantity || 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ item.product_name || item.product?.name || item.name || 'Product Name' }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ item.product?.description || item.description || 'No description' }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Show more indicator -->
            <div v-if="getBundleItems().length > 4" 
                 class="text-center py-2 text-sm text-gray-500 bg-white rounded-md border border-gray-100 border-dashed">
              <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              +{{ getBundleItems().length - 4 }} more items included
            </div>
          </div>
        </div>
      </div>
      
      <!-- Enhanced Product Details -->
      <div class="bg-gray-50 rounded-lg p-5 mb-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Product Details</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Price -->
          <div class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-gray-600">Price</span>
            </div>
            <span class="text-lg font-bold text-gray-900">
              {{ formatCurrency(getPrice()) }}
            </span>
          </div>
          
          <!-- Stock -->
          <div class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" :class="product.stock > 0 ? 'text-green-500' : 'text-red-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-gray-600">Stock</span>
            </div>
            <span class="text-sm font-semibold" :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
              {{ product.stock > 0 ? `${product.stock} available` : 'Out of stock' }}
            </span>
          </div>
          
          <!-- Code/SKU -->
          <div v-if="product.sku || getProductCode()" class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm text-gray-600">{{ product.sku ? 'SKU' : 'Code' }}</span>
            </div>
            <span class="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {{ product.sku || getProductCode() }}
            </span>
          </div>
          
          <!-- Supplier -->
          <div v-if="getSupplierName()" class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm text-gray-600">Supplier</span>
            </div>
            <span class="text-sm text-gray-700 font-medium">
              {{ getSupplierName() }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Enhanced Order Button -->
      <div class="pt-4 border-t border-gray-200">
        <button 
          @click="navigateToOrder"
          :disabled="product.stock <= 0"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg transition-all duration-200 flex items-center justify-center group"
        >
          <svg class="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
          </svg>
          {{ product.stock > 0 ? 'Create Order' : 'Out of Stock' }}
        </button>
        <!-- Additional Info -->
        <p class="text-xs text-gray-500 text-center mt-2">
          Click to proceed to sales order creation
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>