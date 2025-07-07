<script setup lang="ts">
import { formCustomerSchema } from '@/components/customers/data/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast/use-toast'
import { useCustomers } from '@/composables/useCustomers'
import { Check as CheckIcon, Loader2, Plus } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Props {
  customerId?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: [vendor: any]
}>()

const router = useRouter()
const { toast } = useToast()
const { createCustomer } = useCustomers()

const loading = ref(false)
const errors = ref<Record<string, string>>({})
const currentStep = ref(0)

const isEdit = computed(() => !!props.customerId)

const steps = [
  { id: 'basic', title: 'Informasi Dasar', description: 'Data dasar vendor' },
  { id: 'bank', title: 'Rekening Bank', description: 'Informasi rekening' },
  { id: 'tax', title: 'Identifikasi Pajak', description: 'Dokumen pajak' },
  { id: 'review', title: 'Review', description: 'Konfirmasi data' },
]

const formData = reactive({
  name: '',
  address: '',
  phone: '',
  email: '',
  city: '',
  province: '',
  postalcode: '',
  bankAccounts: [] as Array<{
    bankName: string
    accountNumber: string
    accountName: string
    branch: string
    isPrimary: boolean
  }>,
  tax: [] as Array<{
    taxType: string
    taxNumber: string
    taxName: string
    registeredAddress: string
    isActive: boolean
    isPrimary: boolean
  }>,
})

const nextStep = () => {
  if (validateCurrentStep()) currentStep.value++
}

const previousStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const getStepClasses = (index: number) => {
  if (index <= currentStep.value) {
    return 'bg-primary border-primary text-primary-foreground'
  }
  return 'bg-background border-border text-muted-foreground'
}

const validateCurrentStep = () => {
  errors.value = {}

  switch (currentStep.value) {
    case 0:
      if (!formData.name) errors.value.name = 'Nama vendor wajib diisi'
      if (!formData.email) errors.value.email = 'Email wajib diisi'
      if (!formData.phone) errors.value.phone = 'Telepon wajib diisi'
      if (!formData.address) errors.value.address = 'Alamat wajib diisi'
      if (!formData.city) errors.value.city = 'Kota wajib diisi'
      if (!formData.province) errors.value.province = 'Provinsi wajib diisi'
      break
    case 2:
      formData.tax.forEach((tax, index) => {
        if (!tax.taxType) errors.value[`taxType_${index}`] = 'Jenis pajak wajib diisi'
        if (!tax.taxNumber) errors.value[`taxNumber_${index}`] = 'Nomor pajak wajib diisi'
        else if (!/^\d+$/.test(tax.taxNumber)) errors.value[`taxNumber_${index}`] = 'Hanya angka'
        else if (tax.taxNumber.length < 16) errors.value[`taxNumber_${index}`] = 'Minimal 16 digit'
        if (!tax.taxName) errors.value[`taxName_${index}`] = 'Nama pajak wajib diisi'
      })
      break
  }

  return Object.keys(errors.value).length === 0
}

const removeBankAccount = (index: number) => formData.bankAccounts.splice(index, 1)
const setPrimaryBankAccount = (index: number) => {
  formData.bankAccounts.forEach((a, i) => (a.isPrimary = i === index))
}
const addBankAccount = () => {
  formData.bankAccounts.push({
    bankName: '',
    accountNumber: '',
    accountName: '',
    branch: '',
    isPrimary: formData.bankAccounts.length === 0,
  })
}

const removeTax = (index: number) => formData.tax.splice(index, 1)
const setPrimaryTax = (index: number) => {
  formData.tax.forEach((t, i) => (t.isPrimary = i === index))
}
const addTax = () => {
  formData.tax.push({
    taxType: '',
    taxNumber: '',
    taxName: '',
    registeredAddress: '',
    isActive: true,
    isPrimary: formData.tax.length === 0,
  })
}

const initializeFormData = () => {
  if (formData.bankAccounts.length === 0)
    addBankAccount()
  if (formData.tax.length === 0)
    addTax()
}

const normalizeAddresses = () => [
  {
    name: formData.name,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    province: formData.province,
    postalcode: formData.postalcode,
    is_default: true,
    is_deleted: false,
  },
]

const onSubmit = async () => {
  if (!validateCurrentStep()) {
    toast({ title: 'Error', description: 'Mohon periksa kembali form', variant: 'destructive' })
    return
  }

  try {
    loading.value = true
    const payload = {
      ...formData,
      addresses: normalizeAddresses(),
    }
    // console.log('Submitting customer data:', payload)
    const parsed = formCustomerSchema.parse(payload)
    // console.log('Parsed customer data:', parsed)
    await createCustomer(parsed)

    toast({
      title: 'Berhasil',
      description: `Mitra Bisnis berhasil ${isEdit.value ? 'diperbarui' : 'disimpan'}`,
    })

    emit('success', payload)
    await new Promise((r) => setTimeout(r, 2000))
    router.push('/customers')
  } catch (error) {
    console.error('Error saving vendor:', error)
    toast({ title: 'Error', description: 'Gagal menyimpan vendor', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initializeFormData()
})
</script>

<template>
  <div class="containerp-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">
        {{ isEdit ? 'Edit Mitra Bisnis' : 'Tambah Mitra Bisnis Baru' }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ isEdit ? 'Perbarui informasi mitra bisnis' : 'Masukkan informasi mitra bisnis baru dalam beberapa langkah' }}
      </p>
    </div>

    <!-- Stepper -->
    <Card class="mb-8">
      <CardContent class="p-6">
        <nav aria-label="Progress">
          <ol class="flex items-center">
            <li v-for="(step, index) in steps" :key="step.id" class="relative flex-1">
              <div class="flex items-center">
                <!-- Step circle -->
                <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 flex-shrink-0" :class="getStepClasses(index)">
                  <Icon name="lucide:check" v-if="index < currentStep" class="w-5 h-5 text-white" />
                  <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
                </div>
                <!-- Step label -->
                <div class="ml-4 min-w-0 flex-1">
                  <p class="text-sm font-medium transition-colors duration-200" :class="index <= currentStep ? 'text-primary' : 'text-muted-foreground'">
                    {{ step.title }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ step.description }}
                  </p>
                </div>
              </div>

              <!-- Connector line -->
              <div v-if="index < steps.length - 1" class="absolute top-5 left-5 w-full h-0.5 transition-colors duration-200 -z-10" :class="index < currentStep ? 'bg-primary' : 'bg-border'">
              </div>
            </li>
          </ol>
        </nav>
      </CardContent>
    </Card>

    <!-- Form Content -->
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Step 1: Basic Information -->
      <div v-show="currentStep === 0" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>
              Masukkan informasi dasar mitra bisnis
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name">Nama Mitra Bisnis *</Label>
                <Input
                  id="name"
                  v-model="formData.name"
                  :class="{ 'border-destructive': errors.name }"
                  placeholder="Masukkan nama mitra bisnis"
                />
                <p v-if="errors.name" class="text-sm text-destructive">
                  {{ errors.name }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="email">Email *</Label>
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  :class="{ 'border-destructive': errors.email }"
                  placeholder="Masukkan email"
                />
                <p v-if="errors.email" class="text-sm text-destructive">
                  {{ errors.email }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="phone">Telepon *</Label>
                <Input
                  id="phone"
                  v-model="formData.phone"
                  :class="{ 'border-destructive': errors.phone }"
                  placeholder="Masukkan nomor telepon"
                />
                <p v-if="errors.phone" class="text-sm text-destructive">
                  {{ errors.phone }}
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="address">Alamat *</Label>
              <Textarea
                id="address"
                v-model="formData.address"
                :class="{ 'border-destructive': errors.address }"
                placeholder="Masukkan alamat lengkap"
                rows="3"
              />
              <p v-if="errors.address" class="text-sm text-destructive">
                {{ errors.address }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="city">Kota *</Label>
                <Input
                  id="city"
                  v-model="formData.city"
                  :class="{ 'border-destructive': errors.city }"
                  placeholder="Masukkan kota"
                />
                <p v-if="errors.city" class="text-sm text-destructive">
                  {{ errors.city }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="province">Provinsi *</Label>
                <Input
                  id="province"
                  v-model="formData.province"
                  :class="{ 'border-destructive': errors.province }"
                  placeholder="Masukkan provinsi"
                />
                <p v-if="errors.province" class="text-sm text-destructive">
                  {{ errors.province }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="postalcode">Kode Pos</Label>
                <Input
                  id="postalcode"
                  v-model="formData.postalcode"
                  :class="{ 'border-destructive': errors.postalcode }"
                  placeholder="Masukkan kode pos"
                />
                <p v-if="errors.postalcode" class="text-sm text-destructive">
                  {{ errors.postalcode }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Step 2: Bank Accounts -->
      <div v-show="currentStep === 1" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rekening Bank</CardTitle>
            <CardDescription>
              Tambahkan informasi rekening bank mitra bisnis
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(account, index) in formData.bankAccounts" :key="index" class="border p-4 rounded-lg space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="font-medium">Rekening {{ index + 1 }}</h4>
                <Button
                  type="button"
                  v-if="formData.bankAccounts.length > 1"
                  @click="removeBankAccount(index)"
                  variant="destructive"
                  size="sm"
                >
                  Hapus
                </Button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Nama Bank *</Label>
                  <Input
                    v-model="account.bankName"
                    placeholder="Masukkan nama bank"
                  />
                </div>

                <div class="space-y-2">
                  <Label>Nomor Rekening *</Label>
                  <Input
                    v-model="account.accountNumber"
                    placeholder="Masukkan nomor rekening"
                  />
                </div>

                <div class="space-y-2">
                  <Label>Nama Rekening *</Label>
                  <Input
                    v-model="account.accountName"
                    placeholder="Masukkan nama rekening"
                  />
                </div>

                <div class="space-y-2">
                  <Label>Cabang</Label>
                  <Input
                    v-model="account.branch"
                    placeholder="Masukkan cabang"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox
                  :id="`primary-${index}`"
                  v-model:checked="account.isPrimary"
                  @update:checked="setPrimaryBankAccount(index)"
                />
                <Label :for="`primary-${index}`">Rekening Utama</Label>
              </div>
            </div>

            <Button
              type="button"
              @click="addBankAccount"
              variant="outline"
              class="w-full"
            >
              <Plus class="mr-2 h-4 w-4" />
              Tambah Rekening
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Step 3: Tax Identifications -->
      <div v-show="currentStep === 2" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identifikasi Pajak</CardTitle>
            <CardDescription>
              Tambahkan informasi identifikasi pajak mitra bisnis
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="(tax, index) in formData.tax" :key="index" class="border p-4 rounded-lg space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="font-medium">Identifikasi Pajak {{ index + 1 }}</h4>
                <Button
                  type="button"
                  v-if="formData.tax.length > 1"
                  @click="removeTax(index)"
                  variant="destructive"
                  size="sm"
                >
                  Hapus
                </Button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Jenis Pajak *</Label>
                  <Select v-model="tax.taxType">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis pajak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="npwp">NPWP</SelectItem>
                      <SelectItem value="nib">NIB</SelectItem>
                      <SelectItem value="pkp">PKP</SelectItem>
                      <SelectItem value="siup">SIUP</SelectItem>
                      <SelectItem value="tdp">TDP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>Nomor Pajak *</Label>
                  <Input
                    v-model="tax.taxNumber"
                    placeholder="Masukkan nomor pajak"
                  />
                </div>

                <div class="space-y-2">
                  <Label>Nama Pajak *</Label>
                  <Input
                    v-model="tax.taxName"
                    placeholder="Masukkan nama pajak"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Alamat Terdaftar</Label>
                <Textarea
                  v-model="tax.registeredAddress"
                  placeholder="Masukkan alamat terdaftar"
                  rows="2"
                />
              </div>

              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    :id="`active-${index}`"
                    v-model:checked="tax.isActive"
                  />
                  <Label :for="`active-${index}`">Aktif</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox
                    :id="`tax-primary-${index}`"
                    v-model:checked="tax.isPrimary"
                    @update:checked="setPrimaryTax(index)"
                  />
                  <Label :for="`tax-primary-${index}`">Utama</Label>
                </div>
              </div>
            </div>

            <Button
              type="button"
              @click="addTax"
              variant="outline"
              class="w-full"
            >
              <Plus class="mr-2 h-4 w-4" />
              Tambah Identifikasi Pajak
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Step 5: Review -->
      <div v-show="currentStep === 3" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Data</CardTitle>
            <CardDescription>
              Periksa kembali semua informasi sebelum menyimpan
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Review Basic Information -->
            <div class="space-y-4">
              <h4 class="font-semibold">Informasi Dasar</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium">Nama:</span> {{ formData.name }}
                </div>
                <div>
                  <span class="font-medium">Kategori:</span> {{ formData.kategori }}
                </div>
                <div>
                  <span class="font-medium">Email:</span> {{ formData.email }}
                </div>
                <div>
                  <span class="font-medium">Telepon:</span> {{ formData.phone }}
                </div>
                <div class="md:col-span-2">
                  <span class="font-medium">Alamat:</span> {{ formData.address }}
                </div>
                <div>
                  <span class="font-medium">Kota:</span> {{ formData.city }}
                </div>
                <div>
                  <span class="font-medium">Provinsi:</span> {{ formData.province }}
                </div>
              </div>
            </div>

            <Separator />

            <!-- Review Bank Accounts -->
            <div class="space-y-4">
              <h4 class="font-semibold">Rekening Bank</h4>
              <div v-for="(account, index) in formData.bankAccounts.filter(acc => acc.bankName && acc.accountNumber)" :key="index" class="border p-3 rounded text-sm">
                <div class="flex justify-between items-start">
                  <div>
                    <div><span class="font-medium">{{ account.bankName }}</span></div>
                    <div>{{ account.accountNumber }} - {{ account.accountName }}</div>
                    <div v-if="account.branch">Cabang: {{ account.branch }}</div>
                  </div>
                  <div v-if="account.isPrimary" class="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Utama
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <!-- Review Tax Identifications -->
            <div class="space-y-4">
              <h4 class="font-semibold">Identifikasi Pajak</h4>
              <div v-for="(tax, index) in formData.tax.filter(t => t.taxType && t.taxNumber)" :key="index" class="border p-3 rounded text-sm">
                <div class="flex justify-between items-start">
                  <div>
                    <div><span class="font-medium">{{ tax.taxType.toUpperCase() }}</span></div>
                    <div>{{ tax.taxNumber }} - {{ tax.taxName }}</div>
                    <div v-if="tax.registeredAddress">{{ tax.registeredAddress }}</div>
                  </div>
                  <div class="flex gap-2">
                    <div v-if="tax.isPrimary" class="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Utama
                    </div>
                    <div v-if="tax.isActive" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Aktif
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          @click="previousStep"
          :disabled="currentStep === 0"
        >
          Sebelumnya
        </Button>

        <div class="flex gap-2">
          <Button
            type="button"
            variant="outline"
            @click="$emit('cancel')"
          >
            Batal
          </Button>

          <Button
            v-if="currentStep < steps.length - 1"
            type="button"
            @click="nextStep"
          >
            Selanjutnya
          </Button>

          <Button
            v-else
            type="submit"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEdit ? 'Perbarui' : 'Simpan' }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>