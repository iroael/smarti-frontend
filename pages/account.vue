<script setup>
import { ref } from 'vue'
import { User, Building, MapPin, Settings, Plus, Edit2, Trash2, Star, Phone, Mail, ChevronRight, Eye, EyeOff } from 'lucide-vue-next'

// Shadcn/ui components (these would be imported from your components/ui directory)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

// Tab configuration
const tabs = [
  { id: 'profile', label: 'Profil Perusahaan', icon: Building },
  { id: 'address', label: 'Alamat', icon: MapPin },
  { id: 'account', label: 'Keamanan Akun', icon: Settings }
]

// Reactive data
const activeTab = ref('profile')
const showAddressForm = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Profile data
const profileData = ref({
  npwp: '01.234.567.8-901.000',
  companyName: 'PT Teknologi Maju',
  phone: '+62 21 12345678',
  email: 'info@teknologimaju.com',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  postalCode: '12345'
})

// Address data
const addresses = ref([
  {
    id: 1,
    name: 'Kantor Pusat',
    phone: '+62 21 12345678',
    email: 'kantor@teknologimaju.com',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12160',
    address: 'Jl. Sudirman No. 123, Senayan, Jakarta Selatan',
    isDefault: true
  },
  {
    id: 2,
    name: 'Kantor Cabang Bandung',
    phone: '+62 22 87654321',
    email: 'bandung@teknologimaju.com',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40123',
    address: 'Jl. Asia Afrika No. 456, Bandung, Jawa Barat',
    isDefault: false
  },
  {
    id: 3,
    name: 'Gudang Distribusi',
    phone: '+62 21 11122233',
    email: 'gudang@teknologimaju.com',
    city: 'Tangerang',
    province: 'Banten',
    postalCode: '15111',
    address: 'Jl. Industri Raya No. 789, Tangerang, Banten',
    isDefault: false
  }
])

// New address form data
const newAddress = ref({
  name: '',
  phone: '',
  email: '',
  city: '',
  province: '',
  postalCode: '',
  address: '',
  isDefault: false
})

// Account data
const accountData = ref({
  username: 'admin_teknologi',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Methods
const setDefaultAddress = (addressId) => {
  addresses.value.forEach(addr => {
    addr.isDefault = addr.id === addressId
  })
}

const addAddress = () => {
  const nextId = Math.max(...addresses.value.map(a => a.id)) + 1
  
  if (newAddress.value.isDefault) {
    addresses.value.forEach(addr => {
      addr.isDefault = false
    })
  }
  
  addresses.value.push({
    id: nextId,
    ...newAddress.value
  })
  
  // Reset form
  newAddress.value = {
    name: '',
    phone: '',
    email: '',
    city: '',
    province: '',
    postalCode: '',
    address: '',
    isDefault: false
  }
  
  showAddressForm.value = false
}
</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <User class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900">Pengaturan Akun</h1>
            <p class="text-sm text-muted-foreground">Kelola informasi akun Anda</p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col gap-4 px-4 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar Navigation -->
        <div class="lg:w-80 flex-shrink-0">
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-base">Menu Pengaturan</CardTitle>
            </CardHeader>
            <CardContent class="p-2">
              <nav class="space-y-1">
                <Button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :variant="activeTab === tab.id ? 'default' : 'ghost'"
                  class="w-full justify-start h-auto p-3"
                  :class="{
                    'bg-green-500 hover:bg-green-600 text-white': activeTab === tab.id,
                    'hover:bg-gray-100': activeTab !== tab.id
                  }"
                >
                  <component :is="tab.icon" class="w-5 h-5 mr-3 flex-shrink-0" />
                  <span class="text-sm font-medium">{{ tab.label }}</span>
                  <ChevronRight v-if="activeTab === tab.id" class="w-4 h-4 ml-auto" />
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <!-- Main Content -->
        <div class="flex-1 space-y-6">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="space-y-6">
            <!-- Profile Header Card -->
            <Card>
              <CardContent class="p-6">
                <div class="flex items-center gap-4">
                  <Avatar size="lg" class="w-16 h-16">
                    <AvatarImage src="" />
                    <AvatarFallback class="bg-gradient-to-br from-green-400 to-green-600 text-white">
                      <Building class="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 class="text-xl font-semibold">{{ profileData.companyName }}</h3>
                    <p class="text-muted-foreground">NPWP: {{ profileData.npwp }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Profile Form Card -->
            <Card>
              <CardHeader>
                <CardTitle>Informasi Perusahaan</CardTitle>
                <CardDescription>Kelola informasi dasar perusahaan Anda</CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- NPWP -->
                  <div class="space-y-2">
                    <Label for="npwp" class="flex items-center gap-1">
                      NPWP
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      id="npwp"
                      v-model="profileData.npwp"
                      placeholder="00.000.000.0-000.000"
                      class="h-12"
                    />
                  </div>

                  <!-- Company Name -->
                  <div class="space-y-2">
                    <Label for="company" class="flex items-center gap-1">
                      Nama Perusahaan
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      v-model="profileData.companyName"
                      placeholder="PT. Nama Perusahaan"
                      class="h-12"
                    />
                  </div>

                  <!-- Phone -->
                  <div class="space-y-2">
                    <Label for="phone" class="flex items-center gap-1">
                      Nomor Telepon
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      v-model="profileData.phone"
                      type="tel"
                      placeholder="+62 21 12345678"
                      class="h-12"
                    />
                  </div>

                  <!-- Email -->
                  <div class="space-y-2">
                    <Label for="email" class="flex items-center gap-1">
                      Email Perusahaan
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      v-model="profileData.email"
                      type="email"
                      placeholder="email@perusahaan.com"
                      class="h-12"
                    />
                  </div>

                  <!-- Province -->
                  <div class="space-y-2">
                    <Label for="province">Provinsi</Label>
                    <Select v-model="profileData.province">
                      <SelectTrigger class="h-12">
                        <SelectValue placeholder="Pilih Provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                        <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                        <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                        <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                        <SelectItem value="Sumatera Utara">Sumatera Utara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- City -->
                  <div class="space-y-2">
                    <Label for="city">Kota</Label>
                    <Input
                      id="city"
                      v-model="profileData.city"
                      placeholder="Jakarta"
                      class="h-12"
                    />
                  </div>

                  <!-- Postal Code -->
                  <div class="space-y-2">
                    <Label for="postal">Kode Pos</Label>
                    <Input
                      id="postal"
                      v-model="profileData.postalCode"
                      placeholder="12345"
                      class="h-12"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter class="justify-end">
                <Button class="bg-green-600 hover:bg-green-700">
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </Card>
          </div>

          <!-- Address Tab -->
          <div v-if="activeTab === 'address'" class="space-y-6">
            <!-- Address Header Card -->
            <Card>
              <CardContent class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold">Daftar Alamat</h3>
                    <p class="text-sm text-muted-foreground mt-1">Kelola alamat pengiriman dan penagihan</p>
                  </div>
                  <Button
                    @click="showAddressForm = true"
                    class="bg-green-600 hover:bg-green-700"
                  >
                    <Plus class="w-4 h-4 mr-2" />
                    Tambah Alamat
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Address Cards Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                v-for="address in addresses"
                :key="address.id"
                class="relative hover:shadow-md transition-shadow"
                :class="{ 'ring-2 ring-green-500': address.isDefault }"
              >
                <CardContent class="p-6">
                  <!-- Default Badge -->
                  <Badge
                    v-if="address.isDefault"
                    variant="secondary"
                    class="absolute top-4 right-4 bg-green-100 text-green-800 hover:bg-green-100"
                  >
                    <Star class="w-3 h-3 mr-1 fill-current" />
                    Utama
                  </Badge>

                  <div class="space-y-4">
                    <div class="flex items-start justify-between pr-16">
                      <h4 class="font-semibold text-lg">{{ address.name }}</h4>
                      <div class="flex gap-1">
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                          <Edit2 class="w-4 h-4" />
                        </Button>
                        <Button
                          v-if="!address.isDefault"
                          variant="ghost"
                          size="sm"
                          class="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 class="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div class="space-y-2 text-sm text-muted-foreground">
                      <div class="flex items-center gap-2">
                        <Phone class="w-4 h-4" />
                        {{ address.phone }}
                      </div>
                      <div class="flex items-center gap-2">
                        <Mail class="w-4 h-4" />
                        {{ address.email }}
                      </div>
                      <div class="flex items-start gap-2">
                        <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{{ address.address }}</p>
                          <p>{{ address.city }}, {{ address.province }} {{ address.postalCode }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-if="!address.isDefault" class="pt-4 border-t">
                      <Button
                        variant="link"
                        @click="setDefaultAddress(address.id)"
                        class="text-green-600 hover:text-green-700 p-0 h-auto"
                      >
                        Jadikan Alamat Utama
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <!-- Add Address Dialog -->
            <Dialog v-model:open="showAddressForm">
              <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Alamat Baru</DialogTitle>
                  <DialogDescription>
                    Lengkapi informasi alamat untuk keperluan pengiriman dan penagihan
                  </DialogDescription>
                </DialogHeader>
                
                <div class="grid gap-6 py-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Address Name -->
                    <div class="space-y-2 md:col-span-2">
                      <Label for="addr-name" class="flex items-center gap-1">
                        Nama Alamat
                        <span class="text-destructive">*</span>
                      </Label>
                      <Input
                        id="addr-name"
                        v-model="newAddress.name"
                        placeholder="Contoh: Kantor Pusat, Rumah, dll"
                        class="h-12"
                      />
                    </div>
                    
                    <!-- Phone & Email -->
                    <div class="space-y-2">
                      <Label for="addr-phone">Telepon</Label>
                      <Input
                        id="addr-phone"
                        v-model="newAddress.phone"
                        type="tel"
                        placeholder="+62 21 12345678"
                        class="h-12"
                      />
                    </div>
                    
                    <div class="space-y-2">
                      <Label for="addr-email">Email</Label>
                      <Input
                        id="addr-email"
                        v-model="newAddress.email"
                        type="email"
                        placeholder="alamat@perusahaan.com"
                        class="h-12"
                      />
                    </div>
                    
                    <!-- Province & City -->
                    <div class="space-y-2">
                      <Label>Provinsi</Label>
                      <Select v-model="newAddress.province">
                        <SelectTrigger class="h-12">
                          <SelectValue placeholder="Pilih Provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                          <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                          <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div class="space-y-2">
                      <Label for="addr-city">Kota</Label>
                      <Input
                        id="addr-city"
                        v-model="newAddress.city"
                        placeholder="Jakarta"
                        class="h-12"
                      />
                    </div>
                    
                    <!-- Postal Code -->
                    <div class="space-y-2">
                      <Label for="addr-postal">Kode Pos</Label>
                      <Input
                        id="addr-postal"
                        v-model="newAddress.postalCode"
                        placeholder="12345"
                        class="h-12"
                      />
                    </div>
                    
                    <!-- Full Address -->
                    <div class="space-y-2 md:col-span-2">
                      <Label for="addr-full" class="flex items-center gap-1">
                        Alamat Lengkap
                        <span class="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="addr-full"
                        v-model="newAddress.address"
                        placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan"
                        rows="3"
                      />
                    </div>
                    
                    <!-- Default Checkbox -->
                    <div class="flex items-center space-x-2 md:col-span-2">
                      <Checkbox
                        id="addr-default"
                        v-model:checked="newAddress.isDefault"
                      />
                      <Label for="addr-default" class="text-sm font-medium leading-none">
                        Jadikan sebagai alamat utama
                      </Label>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    @click="showAddressForm = false"
                  >
                    Batal
                  </Button>
                  <Button
                    @click="addAddress"
                    class="bg-green-600 hover:bg-green-700"
                  >
                    Simpan Alamat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <!-- Account Tab -->
          <div v-if="activeTab === 'account'">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
                <CardDescription>Kelola username dan password akun Anda</CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="max-w-md space-y-6">
                  <!-- Username -->
                  <div class="space-y-2">
                    <Label for="username">Username</Label>
                    <div class="relative">
                      <Input
                        id="username"
                        v-model="accountData.username"
                        placeholder="username"
                        class="h-12 pr-10"
                      />
                      <User class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <!-- Password Section -->
                  <Card class="bg-muted/50">
                    <CardHeader class="pb-4">
                      <CardTitle class="text-base">Ubah Password</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <!-- Current Password -->
                      <div class="space-y-2">
                        <Label for="current-pwd">Password Saat Ini</Label>
                        <div class="relative">
                          <Input
                            id="current-pwd"
                            v-model="accountData.currentPassword"
                            :type="showCurrentPassword ? 'text' : 'password'"
                            placeholder="Masukkan password saat ini"
                            class="h-12 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="showCurrentPassword = !showCurrentPassword"
                            class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          >
                            <Eye v-if="showCurrentPassword" class="w-4 h-4" />
                            <EyeOff v-else class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <!-- New Password -->
                      <div class="space-y-2">
                        <Label for="new-pwd">Password Baru</Label>
                        <div class="relative">
                          <Input
                            id="new-pwd"
                            v-model="accountData.newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            placeholder="Masukkan password baru"
                            class="h-12 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="showNewPassword = !showNewPassword"
                            class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          >
                            <Eye v-if="showNewPassword" class="w-4 h-4" />
                            <EyeOff v-else class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <!-- Confirm Password -->
                      <div class="space-y-2">
                        <Label for="confirm-pwd">Konfirmasi Password Baru</Label>
                        <div class="relative">
                          <Input
                            id="confirm-pwd"
                            v-model="accountData.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="Konfirmasi password baru"
                            class="h-12 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          >
                            <Eye v-if="showConfirmPassword" class="w-4 h-4" />
                            <EyeOff v-else class="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter class="justify-end">
                <Button class="bg-green-600 hover:bg-green-700">
                  Update Akun
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* UnoCSS utilities - these classes will be processed by UnoCSS */
.container {
  max-width: 1200px;
}

/* Custom utilities for Tokopedia-like styling */
@media (max-width: 1024px) {
  .lg\:w-80 {
    width: 100%;
  }
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>