<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-vue-next'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useCustomers } from '@/composables/useCustomers'
import { useAuth } from '@/composables/useAuth'

// Initialize composables
const { updateCustomer, isAuthenticated } = useCustomers()
const { user } = useAuth()
// Form state management
const profileData = ref({
  npwp: '',
  companyName: '',
  phone: '',
  email: '',
  province: '',
  city: '',
  postalCode: '',
})

const isLoading = ref(false)
const isSaving = ref(false)
const showSuccess = ref(false)
const loadingCustomer = ref(false)

// Validation state
const errors = ref({})
const touched = ref({})

// Province and city data with proper relationship
const provinces = ref([
  { value: 'DKI Jakarta', label: 'DKI Jakarta' },
  { value: 'Jawa Barat', label: 'Jawa Barat' },
  { value: 'Jawa Tengah', label: 'Jawa Tengah' },
  { value: 'Jawa Timur', label: 'Jawa Timur' },
  { value: 'Sumatera Utara', label: 'Sumatera Utara' },
])

const cities = computed(() => {
  const cityMap = {
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat'],
    'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cimahi'],
    'Jawa Tengah': ['Semarang', 'Solo', 'Yogyakarta', 'Magelang', 'Salatiga'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Mojokerto', 'Pasuruan', 'Blitar'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Tebing Tinggi', 'Pematangsiantar', 'Tanjungbalai']
  }
  return cityMap[profileData.value.province] || []
})

// Auto-formatting functions
const formatNPWP = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8)}`
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9)}`
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9, 12)}.${numbers.slice(12, 15)}`
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.startsWith('62')) {
    if (numbers.length <= 4) return `+${numbers}`
    if (numbers.length <= 6) return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`
    if (numbers.length <= 10) return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`
  }
  return value.startsWith('+') ? value : `+62 ${numbers}`
}

// Validation rules
const validateField = (field: string, value: string) => {
  switch (field) {
    case 'npwp':
      if (!value) return 'NPWP wajib diisi'
      if (value.replace(/\D/g, '').length !== 15) return 'NPWP harus 15 digit'
      return null
    case 'companyName':
      if (!value) return 'Nama perusahaan wajib diisi'
      if (value.length < 3) return 'Nama perusahaan minimal 3 karakter'
      return null
    case 'phone':
      if (!value) return 'Nomor telepon wajib diisi'
      const phoneNumbers = value.replace(/\D/g, '')
      if (phoneNumbers.length < 10) return 'Nomor telepon tidak valid'
      return null
    case 'email':
      if (!value) return 'Email wajib diisi'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return 'Format email tidak valid'
      return null
    case 'postalCode':
      if (value && !/^\d{5}$/.test(value)) return 'Kode pos harus 5 digit'
      return null
    default:
      return null
  }
}

// Real-time validation
const validateAllFields = () => {
  const newErrors = {}
  Object.keys(profileData.value).forEach(field => {
    const error = validateField(field, profileData.value[field])
    if (error) newErrors[field] = error
  })
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Form handlers
const handleNPWPInput = (event) => {
  const formatted = formatNPWP(event.target.value)
  profileData.value.npwp = formatted
  if (touched.value.npwp) {
    errors.value.npwp = validateField('npwp', formatted)
  }
}

const handlePhoneInput = (event) => {
  const formatted = formatPhone(event.target.value)
  profileData.value.phone = formatted
  if (touched.value.phone) {
    errors.value.phone = validateField('phone', formatted)
  }
}

const handleFieldBlur = (field) => {
  touched.value[field] = true
  errors.value[field] = validateField(field, profileData.value[field])
}

// Watch province changes to reset city
watch(() => profileData.value.province, (newProvince) => {
  if (newProvince && !cities.value.includes(profileData.value.city)) {
    profileData.value.city = ''
  }
})

// Load data from auth user
const loadUserData = () => {
  if (!user.value) {
    console.warn('No user data available')
    return
  }

  console.log('Loading user data:', user.value)
  
  // Get profile data
  const profile = user.value.profile
  
  // Get default address from addresses array
  const defaultAddress = profile?.addresses?.find(addr => addr.is_default) || profile?.addresses?.[0] || {}
  
  // Populate form with user data
  profileData.value = {
    npwp: profile?.npwp || '',
    companyName: profile?.name || '',
    phone: defaultAddress?.phone || profile?.phone || '',
    email: profile?.email || user.value.email || '',
    province: defaultAddress?.province || profile?.province || '',
    city: defaultAddress?.city || profile?.city || '',
    postalCode: defaultAddress?.postalcode || profile?.postalcode || '',
  }
  
  console.log('Populated profile data:', profileData.value)
}

// Refresh data from auth
const refreshUserData = () => {
  loadingCustomer.value = true
  
  // Simulate loading delay
  setTimeout(() => {
    loadUserData()
    loadingCustomer.value = false
  }, 1000)
}

// Form submission with updateCustomer
const handleSubmit = async () => {
  // Check authentication
  if (!isAuthenticated.value || !user.value) {
    console.warn('User not authenticated')
    return
  }

  // Mark all fields as touched
  Object.keys(profileData.value).forEach(field => {
    touched.value[field] = true
  })

  if (!validateAllFields()) {
    return
  }

  isSaving.value = true
  try {
    // Prepare payload for API
    const payload = {
      npwp: profileData.value.npwp,
      company_name: profileData.value.companyName,
      phone: profileData.value.phone,
      email: profileData.value.email,
      province: profileData.value.province,
      city: profileData.value.city,
      postal_code: profileData.value.postalCode,
    }

    // Get current user ID from auth store
    const userId = user.value?.id || user.value?.profile?.id
    if (!userId) {
      throw new Error('User ID not found')
    }

    // Update customer data
    const result = await updateCustomer(userId, payload)

    if (result) {
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  }
  catch (error) {
    console.error('Error saving profile:', error)
    // You can add error toast notification here
  }
  finally {
    isSaving.value = false
  }
}

// Load user data on component mount
onMounted(() => {
  console.log('Component mounted, checking authentication:', isAuthenticated.value)
  console.log('User data:', user.value)
  
  if (isAuthenticated.value && user.value) {
    loadUserData()
  }
})

// Watch for user data changes
watch(user, (newUser) => {
  if (newUser) {
    console.log('User data changed, reloading profile data')
    loadUserData()
  }
}, { immediate: true })

// Form validation status
const isValid = computed(() => {
  return Object.keys(errors.value).length === 0 && profileData.value.npwp && profileData.value.companyName && profileData.value.phone && profileData.value.email
})

const getFieldStatus = (field) => {
  if (!touched.value[field])
    return 'default'
  return errors.value[field] ? 'error' : 'success'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Success Alert -->
    <Alert v-if="showSuccess" class="border-green-200 bg-green-50">
      <CheckCircle class="h-4 w-4 text-green-600" />
      <AlertDescription class="text-green-800">
        Data perusahaan berhasil disimpan!
      </AlertDescription>
    </Alert>

    <!-- Profile Header Card -->
    <Card class="border-0 shadow-sm">
      <CardContent class="p-6">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Avatar size="lg" class="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback class="bg-gradient-to-br from-green-400 to-green-600 text-white">
                <Building class="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <Badge
              v-if="isValid"
              class="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 bg-green-100 text-green-700 border-green-200"
            >
              <CheckCircle class="h-3 w-3" />
            </Badge>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">{{ profileData.companyName || 'Nama Perusahaan' }}</h3>
            <p class="text-sm text-gray-600">NPWP: {{ profileData.npwp || 'Belum diisi' }}</p>
            <Badge
              :variant="isValid ? 'default' : 'secondary'"
              class="mt-2 text-xs"
              :class="isValid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ isValid ? 'Profil Lengkap' : 'Perlu Dilengkapi' }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Company Information Form Card -->
    <Card class="border-0 shadow-sm">
      <CardHeader class="pb-6">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-lg font-semibold text-gray-900">Informasi Perusahaan</CardTitle>
            <CardDescription class="text-gray-600">
              Kelola informasi dasar perusahaan Anda dengan lengkap dan akurat
            </CardDescription>
          </div>
          <Button
            @click="refreshUserData"
            :disabled="loadingCustomer"
            variant="outline"
            size="sm"
            class="ml-4"
          >
            <RefreshCw :class="loadingCustomer ? 'animate-spin' : ''" class="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <!-- Loading Overlay -->
      <div v-if="loadingCustomer" class="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
        <div class="flex items-center gap-2 text-gray-600">
          <Loader2 class="w-5 h-5 animate-spin" />
          <span>Memuat data customer...</span>
        </div>
      </div>

      <CardContent class="space-y-6 relative">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- NPWP -->
          <div class="space-y-2">
            <Label for="npwp" class="flex items-center gap-1 text-sm font-medium">
              NPWP <span class="text-red-500">*</span>
            </Label>
            <div class="relative">
              <Input
                id="npwp"
                :value="profileData.npwp"
                @input="handleNPWPInput"
                @blur="() => handleFieldBlur('npwp')"
                placeholder="00.000.000.0-000.000"
                class="h-12 pr-10"
                :class="{
                  'border-red-300 focus:border-red-500': getFieldStatus('npwp') === 'error',
                  'border-green-300 focus:border-green-500': getFieldStatus('npwp') === 'success'
                }"
                maxlength="20"
              />
              <div v-if="getFieldStatus('npwp') !== 'default'" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle v-if="getFieldStatus('npwp') === 'success'" class="h-4 w-4 text-green-500" />
                <AlertCircle v-else class="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p v-if="errors.npwp" class="text-xs text-red-600">{{ errors.npwp }}</p>
          </div>

          <!-- Nama Perusahaan -->
          <div class="space-y-2">
            <Label for="company" class="flex items-center gap-1 text-sm font-medium">
              Nama Perusahaan <span class="text-red-500">*</span>
            </Label>
            <div class="relative">
              <Input
                id="company"
                v-model="profileData.companyName"
                @blur="() => handleFieldBlur('companyName')"
                placeholder="PT. Nama Perusahaan"
                class="h-12 pr-10"
                :class="{
                  'border-red-300 focus:border-red-500': getFieldStatus('companyName') === 'error',
                  'border-green-300 focus:border-green-500': getFieldStatus('companyName') === 'success'
                }"
              />
              <div v-if="getFieldStatus('companyName') !== 'default'" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle v-if="getFieldStatus('companyName') === 'success'" class="h-4 w-4 text-green-500" />
                <AlertCircle v-else class="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p v-if="errors.companyName" class="text-xs text-red-600">{{ errors.companyName }}</p>
          </div>

          <!-- Telepon -->
          <div class="space-y-2">
            <Label for="phone" class="flex items-center gap-1 text-sm font-medium">
              Nomor Telepon <span class="text-red-500">*</span>
            </Label>
            <div class="relative">
              <Input
                id="phone"
                :value="profileData.phone"
                @input="handlePhoneInput"
                @blur="() => handleFieldBlur('phone')"
                type="tel"
                placeholder="+62 21 1234-5678"
                class="h-12 pr-10"
                :class="{
                  'border-red-300 focus:border-red-500': getFieldStatus('phone') === 'error',
                  'border-green-300 focus:border-green-500': getFieldStatus('phone') === 'success'
                }"
              />
              <div v-if="getFieldStatus('phone') !== 'default'" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle v-if="getFieldStatus('phone') === 'success'" class="h-4 w-4 text-green-500" />
                <AlertCircle v-else class="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p v-if="errors.phone" class="text-xs text-red-600">{{ errors.phone }}</p>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <Label for="email" class="flex items-center gap-1 text-sm font-medium">
              Email Perusahaan <span class="text-red-500">*</span>
            </Label>
            <div class="relative">
              <Input
                id="email"
                v-model="profileData.email"
                @blur="() => handleFieldBlur('email')"
                type="email"
                placeholder="email@perusahaan.com"
                class="h-12 pr-10"
                :class="{
                  'border-red-300 focus:border-red-500': getFieldStatus('email') === 'error',
                  'border-green-300 focus:border-green-500': getFieldStatus('email') === 'success'
                }"
              />
              <div v-if="getFieldStatus('email') !== 'default'" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle v-if="getFieldStatus('email') === 'success'" class="h-4 w-4 text-green-500" />
                <AlertCircle v-else class="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p v-if="errors.email" class="text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Provinsi -->
          <div class="space-y-2">
            <Label for="province" class="text-sm font-medium">Provinsi</Label>
            <Select v-model="profileData.province">
              <SelectTrigger class="h-12">
                <SelectValue placeholder="Pilih Provinsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="province in provinces" 
                  :key="province.value" 
                  :value="province.value"
                >
                  {{ province.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Kota -->
          <div class="space-y-2">
            <Label for="city" class="text-sm font-medium">Kota</Label>
            <Select v-model="profileData.city" :disabled="!profileData.province">
              <SelectTrigger class="h-12">
                <SelectValue placeholder="Pilih Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="city in cities" 
                  :key="city" 
                  :value="city"
                >
                  {{ city }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Kode Pos -->
          <div class="space-y-2 md:col-span-1">
            <Label for="postal" class="text-sm font-medium">Kode Pos</Label>
            <div class="relative">
              <Input
                id="postal"
                v-model="profileData.postalCode"
                @blur="() => handleFieldBlur('postalCode')"
                placeholder="12345"
                class="h-12 pr-10"
                :class="{
                  'border-red-300 focus:border-red-500': getFieldStatus('postalCode') === 'error',
                  'border-green-300 focus:border-green-500': getFieldStatus('postalCode') === 'success'
                }"
                maxlength="5"
                pattern="[0-9]*"
              />
              <div v-if="getFieldStatus('postalCode') !== 'default'" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle v-if="getFieldStatus('postalCode') === 'success'" class="h-4 w-4 text-green-500" />
                <AlertCircle v-else class="h-4 w-4 text-red-500" />
              </div>
            </div>
            <p v-if="errors.postalCode" class="text-xs text-red-600">{{ errors.postalCode }}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter class="justify-between pt-6">
        <div class="text-sm text-gray-500">
          <span class="text-red-500">*</span> Wajib diisi
        </div>
        <Button 
          @click="handleSubmit"
          :disabled="!isValid || isSaving"
          class="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 min-w-[140px]"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>