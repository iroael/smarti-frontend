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
  navigateTo(`/orders/create?product_id=${props.product.id}`)
}

// Determine card gradient based on product type
const getCardGradient = () => {
  if ((props.product as any).is_bundle) {
    return 'from-emerald-50 via-teal-50 to-cyan-50'
  }
  return 'from-blue-50 via-indigo-50 to-purple-50'
}

// Get stock status color
const getStockStatus = () => {
  if (props.product.stock > 20) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (props.product.stock > 5) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  if (props.product.stock > 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  return { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
}

// Bundle items collapse state
const showAllBundleItems = ref(false)

// Toggle bundle items visibility
const toggleBundleItems = () => {
  showAllBundleItems.value = !showAllBundleItems.value
}
</script>

<template>
  <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
    <!-- Enhanced Header with Dynamic Gradient -->
    <div class="relative h-56 bg-gradient-to-br overflow-hidden" :class="getCardGradient()">
      <!-- Animated Background Pattern -->
      <div class="absolute inset-0 opacity-[0.08]">
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
              <g fill="none" stroke="currentColor" stroke-width="0.5">
                <polygon points="24,37 12,43 0,37 0,25 12,19 24,25" />
                <polygon points="24,12 12,18 0,12 0,0 12,-6 24,0" />
                <polygon points="52,37 40,43 28,37 28,25 40,19 52,25" />
                <polygon points="52,12 40,18 28,12 28,0 40,-6 52,0" />
              </g>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#hexagons)" />
        </svg>
      </div>
      
      <!-- Glowing Orb Effect -->
      <div class="absolute top-8 right-8 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
      
      <!-- Main Product Icon with Enhanced Animation -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative transform group-hover:scale-105 transition-all duration-300">
          <!-- Icon Background -->
          <div class="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
            <svg class="w-12 h-12 text-blue-600 drop-shadow-sm" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 12l8-4"/>
            </svg>
          </div>
          
          <!-- Pulse animation for bundle -->
          <div v-if="(product as any).is_bundle" 
               class="absolute inset-0 w-24 h-24 rounded-2xl border-2 border-emerald-400/30 animate-pulse-slow">
          </div>
        </div>
      </div>
      
      <!-- Enhanced Top Badges -->
      <div class="absolute top-5 left-5 flex gap-2">
        <!-- Bundle/Product Badge -->
        <div v-if="(product as any).is_bundle" 
             class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg backdrop-blur-sm border border-white/20">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          Bundle
          <span v-if="getBundleItemsCount() > 0" 
                class="ml-2 px-2 py-0.5 bg-white/25 rounded-full text-xs font-bold">
            {{ getBundleItemsCount() }}
          </span>
        </div>
        <div v-else 
             class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border border-white/20">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
          </svg>
          Product
        </div>
      </div>
      
      <!-- Product ID & Stock Status -->
      <div class="absolute top-5 right-5 flex flex-col gap-2 items-end">
        <!-- Product ID -->
        <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono text-gray-700 bg-white/80 backdrop-blur-sm shadow-sm border border-white/50">
          #{{ product.product_code }}
        </span>
        
        <!-- Stock Status -->
        <div class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm border backdrop-blur-sm"
             :class="[getStockStatus().color, getStockStatus().bg, getStockStatus().border]">
          <div class="w-2 h-2 rounded-full mr-1.5" 
               :class="product.stock > 0 ? 'bg-current animate-pulse' : 'bg-current'"></div>
          {{ product.stock > 0 ? `${product.stock}` : 'Out' }}
        </div>
      </div>
    </div>
    
    <!-- Enhanced Content Section -->
    <div class="p-6 space-y-6">
      <!-- Product Title & Description -->
      <div class="space-y-3">
        <h1 class="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {{ product.name }}
        </h1>
        <p class="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {{ product.description || 'Deskripsi produk tidak tersedia. Silakan hubungi tim sales untuk informasi lebih lanjut.' }}
        </p>
      </div>

      <!-- Product Quick Details (moved to top) -->
      <div class="bg-gradient-to-br from-gray-50 to-gray-100/30 rounded-xl p-4 border border-gray-200/50">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <!-- Price -->
          <div class="flex items-center justify-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-200">
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-1">Price</div>
              <div class="text-lg font-bold text-green-600">
                {{ formatCurrency(getPrice()) }}
              </div>
            </div>
          </div>
          
          <!-- Stock -->
          <div class="flex items-center justify-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200"
               :class="product.stock > 0 ? 'hover:shadow-md hover:border-green-200' : 'hover:shadow-md hover:border-red-200'">
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-1">Stock</div>
              <div class="flex items-center justify-center">
                <div class="w-2 h-2 rounded-full mr-2" 
                     :class="product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></div>
                <span class="text-sm font-bold" :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
                  {{ product.stock > 0 ? product.stock : 'Out' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Supplier Info (if exists) -->
        <div v-if="getSupplierName()" class="mt-3 pt-3 border-t border-gray-200">
          <div class="flex items-center justify-center p-2 bg-white rounded-lg shadow-sm border border-gray-100">
            <div class="flex items-center text-sm">
              <svg class="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-gray-600 mr-2">Supplier:</span>
              <span class="font-semibold text-gray-700">{{ getSupplierName() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Enhanced Bundle Items Display -->
      <div v-if="(product as any).is_bundle && getBundleItems().length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700 flex items-center">
            <svg class="w-4 h-4 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            Bundle Contents
          </h3>
          <span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
            {{ getBundleItems().length }} items
          </span>

            <!-- Toggle button for more items -->
            <div v-if="getBundleItems().length > 2" 
                 @click="toggleBundleItems"
                 class="text-center py-3 text-sm text-blue-600 bg-white/70 rounded-lg border border-blue-200 border-dashed hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer select-none">
              <div class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2 transition-transform duration-200" 
                     :class="showAllBundleItems ? 'rotate-180' : ''" 
                     fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">
                  {{ showAllBundleItems 
                    ? 'Show Less' 
                    : `Show ${getBundleItems().length - 2}` 
                  }}
                </span>
              </div>
            </div>
        </div>
        
        <div class="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50">
          <div class="space-y-3">
            <!-- Show first 2 items -->
            <div 
              v-for="(item, index) in (showAllBundleItems ? getBundleItems() : getBundleItems().slice(0, 2))" 
              :key="item.id || index"
              class="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
            >
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white mr-3 flex-shrink-0 shadow-sm">
                {{ item.quantity || 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ item.product_name || item.product?.name || item.name || 'Product Name' }}
                </p>
                <p class="text-xs text-gray-500 truncate mt-0.5">
                  {{ item.product?.description || item.description || 'No description available' }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      <!-- Enhanced Order Button -->
      <div class="pt-2">
        <button 
          @click="navigateToOrder"
          :disabled="product.stock <= 0"
          class="w-full relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-sm transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-300 flex items-center justify-center group/btn overflow-hidden"
        >
          <!-- Button Background Effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          
          <svg class="w-5 h-5 mr-2 relative z-10" :class="product.stock > 0 ? 'group-hover/btn:animate-bounce' : ''" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
          </svg>
          <span class="relative z-10">
            {{ product.stock > 0 ? 'Create Order' : 'Out of Stock' }}
          </span>
        </button>
        
        <!-- Additional Info -->
        <div class="flex items-center justify-center mt-3 text-xs text-gray-500">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          Click to proceed to sales order creation
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

/* Enhanced hover effects */
.group:hover .group-hover\:animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25%);
  }
}

/* Smooth scrolling for bundle items */
.bundle-items-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.bundle-items-container::-webkit-scrollbar {
  width: 4px;
}

.bundle-items-container::-webkit-scrollbar-track {
  background: transparent;
}

.bundle-items-container::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.bundle-items-container::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>