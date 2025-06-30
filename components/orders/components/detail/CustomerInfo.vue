<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { User, Mail, Phone, MapPin, FileText } from 'lucide-vue-next'
import { useAddress } from '~/composables/useAddress'

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  npwp?: string
  province?: string
  city?: string
  postalcode?: string
  address: string
  createdAt: string
}

interface Address {
  id: number
  ownerType: string
  ownerId: number
  name: string
  phone: string
  city?: string
  province?: string
  postalcode?: string
  address: string
  is_deleted: boolean
  is_default: boolean
  createdAt: string
}

interface Props {
  customer: Customer
  deliveryAddress?: string
}

const props = defineProps<Props>()

const { getAddressById } = useAddress()
const deliveryAddressData = ref<Address | null>(null)
const loadingDelivery = ref(false)

const fetchDeliveryAddress = async () => {
  if (props.deliveryAddress) {
    try {
      loadingDelivery.value = true
      const data = await getAddressById(props.deliveryAddress)
      deliveryAddressData.value = data
    } catch (error) {
      console.error('[CustomerInfo] Failed to fetch delivery address:', error)
      deliveryAddressData.value = null
    } finally {
      loadingDelivery.value = false
    }
  } else {
    deliveryAddressData.value = null
  }
}

onMounted(() => {
  fetchDeliveryAddress()
})

watch(() => props.deliveryAddress, () => {
  fetchDeliveryAddress()
}, { immediate: false })
</script>

<template>
  <div class="bg-card rounded-lg border shadow-sm p-6">
    <div class="flex items-center gap-3 mb-6">
      <User class="h-5 w-5 text-primary" />
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        Customer Information
      </h3>
    </div>
    
    <div class="space-y-5">
      <!-- Customer Name -->
      <div class="grid gap-1">
        <label class="text-sm font-medium text-muted-foreground">Name</label>
        <p class="text-sm font-medium">{{ customer.name }}</p>
      </div>
      
      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="grid gap-1">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Mail class="h-4 w-4" />
            <label class="text-sm font-medium">Email</label>
          </div>
          <p class="text-sm">
            <a 
              :href="`mailto:${customer.email}`" 
              class="hover:text-primary hover:underline"
            >
              {{ customer.email }}
            </a>
          </p>
        </div>
        
        <div class="grid gap-1">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Phone class="h-4 w-4" />
            <label class="text-sm font-medium">Phone</label>
          </div>
          <p class="text-sm">
            <a 
              :href="`tel:${customer.phone}`" 
              class="hover:text-primary hover:underline"
            >
              {{ customer.phone }}
            </a>
          </p>
        </div>
      </div>
      
      <!-- NPWP -->
      <div v-if="customer.npwp" class="grid gap-1">
        <div class="flex items-center gap-2 text-muted-foreground">
          <FileText class="h-4 w-4" />
          <label class="text-sm font-medium">NPWP</label>
        </div>
        <p class="text-sm">{{ customer.npwp }}</p>
      </div>
      
      <!-- Address -->
      <div class="grid gap-1">
        <div class="flex items-center gap-2 text-muted-foreground">
          <MapPin class="h-4 w-4" />
          <label class="text-sm font-medium">Address</label>
        </div>
        <div class="text-sm">
          <p>{{ customer.address }}</p>
          <p 
            v-if="customer.city || customer.province || customer.postalcode" 
            class="text-muted-foreground mt-1"
          >
            {{ [customer.city, customer.province, customer.postalcode].filter(Boolean).join(', ') }}
          </p>
        </div>
      </div>

      <!-- Loading Delivery -->
      <div v-if="loadingDelivery" class="text-sm text-muted-foreground">
        Loading delivery address...
      </div>

      <!-- Delivery Address (if different) -->
      <div 
        v-if="deliveryAddress && deliveryAddressData && !loadingDelivery" 
        class="grid gap-1 border rounded-md p-3 bg-muted"
      >
        <div class="flex items-center gap-2 text-muted-foreground">
          <MapPin class="h-4 w-4 text-orange-500" />
          <label class="text-sm font-medium">Delivery Address</label>
        </div>
        <div class="text-sm">
          <p class="font-medium">{{ deliveryAddressData.name }}</p>
          <p>{{ deliveryAddressData.address }}</p>
          <p
            v-if="deliveryAddressData.city || deliveryAddressData.province || deliveryAddressData.postalcode"
            class="text-muted-foreground"
          >
            {{ [deliveryAddressData.city, deliveryAddressData.province, deliveryAddressData.postalcode].filter(Boolean).join(', ') }}
          </p>
          <p class="mt-1">
            <a 
              :href="`tel:${deliveryAddressData.phone}`" 
              class="hover:text-primary hover:underline"
            >
              {{ deliveryAddressData.phone }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>