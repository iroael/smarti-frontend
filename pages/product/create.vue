<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useProducts } from '@/composables/useProducts'
import { useSuppliers } from '@/composables/useSupplier'
import { useProductTax } from '@/composables/useProductTax'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const { createProduct, fetchProductNonBundle, nonBundleProducts } = useProducts()
const { suppliers, loading: suppliersLoading, fetchSuppliers } = useSuppliers()
const { taxes, loading: taxesLoading, fetchTaxes } = useProductTax()

// Fetch data saat component dimount
await Promise.all([
  fetchProductNonBundle(),
  fetchSuppliers(),
  fetchTaxes()
])

// Mendapatkan parameter dari URL
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('type')
}

const urlType = ref(getUrlParams())
const isBundleFromUrl = computed(() => urlType.value === 'bundling')
const isDisabledSwitch = computed(() => urlType.value === 'bundling' || urlType.value === 'nonbundling')

const schema = toTypedSchema(z.object({
  product_code: z.string().min(1, 'Kode produk wajib diisi'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
  is_bundle: z.boolean(),
  supplier_id: z.number().min(1, 'Supplier wajib dipilih'),
  tax_id: z.number().min(1, 'Pajak wajib dipilih'),
  price: z.object({
    dpp_beli: z.number().min(0, 'DPP Beli harus 0 atau lebih'),
    dpp_jual: z.number().min(0, 'DPP Jual harus 0 atau lebih'),
    h_jual_b: z.number().min(0, 'Harga Jual harus 0 atau lebih'),
  }),
  bundleItems: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1, 'Quantity minimal 1'),
  })).optional().refine((items) => {
    // Validasi untuk bundle: harus ada minimal 1 item
    return !isBundleFromUrl.value || (items && items.length > 0)
  }, {
    message: 'Bundle harus memiliki minimal 1 item'
  }),
}))

const {
  values,
  errors,
  setFieldValue,
  handleSubmit,
  resetForm,
} = useForm({
  validationSchema: schema,
  initialValues: {
    product_code: '',
    name: '',
    description: '',
    stock: 0,
    is_bundle: isBundleFromUrl.value,
    supplier_id: suppliers.value[0]?.id || 0,
    tax_id: taxes.value[0]?.id || 0,
    price: {
      dpp_beli: 0,
      dpp_jual: 0,
      h_jual_b: 0,
    },
    bundleItems: []
  },
})

// Setup saat component dimount
onMounted(() => {
  // Set nilai is_bundle berdasarkan URL parameter
  if (urlType.value === 'bundling') {
    setFieldValue('is_bundle', true)
  } else if (urlType.value === 'nonbundling') {
    setFieldValue('is_bundle', false)
  }
  
  // Set default supplier jika belum dipilih dan ada data supplier
  if (suppliers.value.length > 0 && values.supplier_id === 0) {
    setFieldValue('supplier_id', suppliers.value[0].id)
  }
  
  // Set default tax jika belum dipilih dan ada data tax
  if (taxes.value.length > 0 && values.tax_id === 0) {
    setFieldValue('tax_id', taxes.value[0].id)
  }
})

// Watch suppliers data untuk set default value
watch(suppliers, (newSuppliers) => {
  if (newSuppliers.length > 0 && values.supplier_id === 0) {
    setFieldValue('supplier_id', newSuppliers[0].id)
  }
}, { immediate: true })

// Watch taxes data untuk set default value
watch(taxes, (newTaxes) => {
  if (newTaxes.length > 0 && values.tax_id === 0) {
    setFieldValue('tax_id', newTaxes[0].id)
  }
}, { immediate: true })

// Get tax info by ID
const getTaxInfo = (id: number) => {
  const tax = taxes.value.find(t => t.id === id)
  return tax || null
}

// Selected tax info
const selectedTax = computed(() => {
  return getTaxInfo(values.tax_id)
})

// Calculate tax amount
const calculateTaxAmount = (baseAmount: number) => {
  if (!selectedTax.value) return 0
  const taxRate = selectedTax.value.rate || 0
  return (baseAmount * taxRate) / 100
}

// Calculate price with tax
const pricesWithTax = computed(() => {
  const basePrices = values.is_bundle ? bundlePrices.value : values.price
  
  return {
    dpp_beli: basePrices.dpp_beli,
    dpp_jual: basePrices.dpp_jual,
    h_jual_b: basePrices.h_jual_b,
    tax_amount: calculateTaxAmount(basePrices.h_jual_b),
    total_with_tax: basePrices.h_jual_b + calculateTaxAmount(basePrices.h_jual_b)
  }
})

// Saat item bundle dipilih
function toggleBundleItem(product_id: number, checked: boolean) {
  const current = new Map(values.bundleItems?.map(item => [item.product_id, item]) ?? [])
  if (checked) {
    current.set(product_id, { product_id, quantity: 1 })
  } else {
    current.delete(product_id)
  }
  setFieldValue('bundleItems', Array.from(current.values()))
}

// Update quantity bundle item
function updateBundleItemQuantity(product_id: number, quantity: number) {
  if (quantity < 1) quantity = 1
  const current = values.bundleItems?.map(item => 
    item.product_id === product_id 
      ? { ...item, quantity } 
      : item
  ) || []
  setFieldValue('bundleItems', current)
}

// Perhitungan harga otomatis untuk bundle
const bundlePrices = computed(() => {
  if (!values.is_bundle || !values.bundleItems || values.bundleItems.length === 0) {
    return {
      dpp_beli: 0,
      dpp_jual: 0,
      h_jual_b: 0,
    }
  }

  return values.bundleItems.reduce((totals, item) => {
    const found = nonBundleProducts.value.find(p => p.id === item.product_id)
    if (found && found.prices && found.prices[0]) {
      const price = found.prices[0]
      return {
        dpp_beli: totals.dpp_beli + (Number(price.dpp_beli) || 0) * item.quantity,
        dpp_jual: totals.dpp_jual + (Number(price.dpp_jual) || 0) * item.quantity,
        h_jual_b: totals.h_jual_b + (Number(price.h_jual_b) || 0) * item.quantity,
      }
    }
    return totals
  }, {
    dpp_beli: 0,
    dpp_jual: 0,
    h_jual_b: 0,
  })
})

// Auto update harga saat bundle items berubah
watch([() => values.bundleItems, () => values.is_bundle], () => {
  if (values.is_bundle) {
    const prices = bundlePrices.value
    setFieldValue('price.dpp_beli', prices.dpp_beli)
    setFieldValue('price.dpp_jual', prices.dpp_jual)
    setFieldValue('price.h_jual_b', prices.h_jual_b)
  }
}, { deep: true })

// Auto disable input harga saat bundle
watch(() => values.is_bundle, val => {
  if (val) {
    const prices = bundlePrices.value
    setFieldValue('price', {
      dpp_beli: prices.dpp_beli,
      dpp_jual: prices.dpp_jual,
      h_jual_b: prices.h_jual_b,
    })
  }
})

// Get supplier name by ID
const getSupplierName = (id: number) => {
  const supplier = suppliers.value.find(s => s.id === id)
  return supplier ? supplier.name : `Supplier ${id}`
}

// Selected items for bundle summary
const selectedBundleItems = computed(() => {
  if (!values.bundleItems || values.bundleItems.length === 0) return []
  
  return values.bundleItems.map(item => {
    const product = nonBundleProducts.value.find(p => p.id === item.product_id)
    return {
      ...item,
      product
    }
  }).filter(item => item.product)
})

// Submit
const onSubmit = handleSubmit(async (data) => {
  try {
    // Validasi tambahan untuk bundle
    if (data.is_bundle && (!data.bundleItems || data.bundleItems.length === 0)) {
      toast.error('Bundle harus memiliki minimal 1 item')
      return
    }
    
    await createProduct(data)
    toast.success('Produk berhasil disimpan!')
    resetForm()
    
    // Reset ke nilai default
    if (suppliers.value.length > 0) {
      setFieldValue('supplier_id', suppliers.value[0].id)
    }
    if (taxes.value.length > 0) {
      setFieldValue('tax_id', taxes.value[0].id)
    }
  } catch (e: any) {
    toast.error('Gagal menyimpan', {
      description: e?.data?.message || e.message || 'Terjadi kesalahan.'
    })
  }
})

// Loading state
const isLoading = computed(() => suppliersLoading.value || taxesLoading.value)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        Tambah Produk {{ urlType === 'bundling' ? '(Bundle)' : urlType === 'nonbundling' ? '(Non-Bundle)' : '' }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="flex items-center justify-center p-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p class="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
      
      <form v-else @submit.prevent="onSubmit" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="product_code">Kode Produk <span class="text-red-500">*</span></Label>
            <Input 
              id="product_code" 
              :model-value="values.product_code" 
              @update:modelValue="val => setFieldValue('product_code', val)"
              placeholder="Masukkan kode produk"
              :class="errors.product_code ? 'border-red-500' : ''"
            />
            <p v-if="errors.product_code" class="text-sm text-red-500">{{ errors.product_code }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="name">Nama Produk <span class="text-red-500">*</span></Label>
            <Input 
              id="name" 
              :model-value="values.name" 
              @update:modelValue="val => setFieldValue('name', val)"
              placeholder="Masukkan nama produk"
              :class="errors.name ? 'border-red-500' : ''"
            />
            <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="stock">Stok</Label>
            <Input 
              id="stock" 
              type="number" 
              :model-value="values.stock" 
              @update:modelValue="val => setFieldValue('stock', Number(val))"
              placeholder="0"
              min="0"
              :class="errors.stock ? 'border-red-500' : ''"
            />
            <p v-if="errors.stock" class="text-sm text-red-500">{{ errors.stock }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="supplier_id">Supplier <span class="text-red-500">*</span></Label>
            <Select 
              :model-value="values.supplier_id.toString()" 
              @update:modelValue="val => setFieldValue('supplier_id', Number(val))"
            >
              <SelectTrigger :class="errors.supplier_id ? 'border-red-500' : ''">
                <SelectValue placeholder="Pilih supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="supplier in suppliers" 
                  :key="supplier.id" 
                  :value="supplier.id.toString()"
                >
                  {{ supplier.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.supplier_id" class="text-sm text-red-500">{{ errors.supplier_id }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="tax_id">Pajak <span class="text-red-500">*</span></Label>
            <Select 
              :model-value="values.tax_id.toString()" 
              @update:modelValue="val => setFieldValue('tax_id', Number(val))"
            >
              <SelectTrigger :class="errors.tax_id ? 'border-red-500' : ''">
                <SelectValue placeholder="Pilih pajak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="tax in taxes" 
                  :key="tax.id" 
                  :value="tax.id.toString()"
                >
                  {{ tax.name }} ({{ tax.rate }}%)
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.tax_id" class="text-sm text-red-500">{{ errors.tax_id }}</p>
            <p v-if="selectedTax" class="text-xs text-blue-600">
              Tarif pajak: {{ selectedTax.rate }}%
            </p>
          </div>
          
          <div class="space-y-2">
            <Label>Produk Bundle?</Label>
            <div class="flex items-center space-x-2">
              <Switch 
                :checked="values.is_bundle" 
                :disabled="isDisabledSwitch"
                @update:checked="val => setFieldValue('is_bundle', val)" 
              />
              <span class="text-sm">{{ values.is_bundle ? 'Ya' : 'Tidak' }}</span>
            </div>
            <p v-if="isDisabledSwitch" class="text-xs text-gray-500">
              Switch dikunci berdasarkan parameter URL ({{ urlType }})
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Deskripsi <span class="text-red-500">*</span></Label>
          <Textarea 
            id="description" 
            :model-value="values.description" 
            @update:modelValue="val => setFieldValue('description', val)"
            placeholder="Masukkan deskripsi produk"
            :class="errors.description ? 'border-red-500' : ''"
          />
          <p v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</p>
        </div>

        <!-- Harga -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg">Informasi Harga</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>DPP Beli</Label>
              <Input 
                type="number" 
                :model-value="values.is_bundle ? bundlePrices.dpp_beli : values.price.dpp_beli" 
                :disabled="values.is_bundle" 
                @update:modelValue="val => setFieldValue('price.dpp_beli', Number(val))"
                placeholder="0"
                min="0"
              />
              <p v-if="values.is_bundle" class="text-xs text-green-600">
                Otomatis terhitung: Rp {{ bundlePrices.dpp_beli.toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="space-y-2">
              <Label>DPP Jual</Label>
              <Input 
                type="number" 
                :model-value="values.is_bundle ? bundlePrices.dpp_jual : values.price.dpp_jual" 
                :disabled="values.is_bundle" 
                @update:modelValue="val => setFieldValue('price.dpp_jual', Number(val))"
                placeholder="0"
                min="0"
              />
              <p v-if="values.is_bundle" class="text-xs text-green-600">
                Otomatis terhitung: Rp {{ bundlePrices.dpp_jual.toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="space-y-2">
              <Label>Harga Jual</Label>
              <Input 
                type="number" 
                :model-value="values.is_bundle ? bundlePrices.h_jual_b : values.price.h_jual_b" 
                :disabled="values.is_bundle" 
                @update:modelValue="val => setFieldValue('price.h_jual_b', Number(val))"
                placeholder="0"
                min="0"
              />
              <p v-if="values.is_bundle" class="text-xs text-green-600">
                Otomatis terhitung: Rp {{ bundlePrices.h_jual_b.toLocaleString('id-ID') }}
              </p>
            </div>
          </div>
          
          <!-- Tax Information -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-900 mb-2">Informasi Pajak</h4>
            <div class="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-blue-700">Harga Dasar:</span>
                <p class="font-medium">Rp {{ pricesWithTax.h_jual_b.toLocaleString('id-ID') }}</p>
              </div>
              <div>
                <span class="text-blue-700">Pajak ({{ selectedTax?.rate || 0 }}%):</span>
                <p class="font-medium">Rp {{ pricesWithTax.tax_amount.toLocaleString('id-ID') }}</p>
              </div>
              <div>
                <span class="text-blue-700">Total + Pajak:</span>
                <p class="font-medium text-blue-900">Rp {{ pricesWithTax.total_with_tax.toLocaleString('id-ID') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bundle Items -->
        <div v-if="values.is_bundle" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-lg">Item dalam Bundle</h3>
            <p class="text-sm text-muted-foreground">
              {{ selectedBundleItems.length }} item dipilih
            </p>
          </div>
          
          <!-- Bundle Summary -->
          <div v-if="selectedBundleItems.length > 0" class="bg-muted p-4 rounded-lg">
            <h4 class="font-medium mb-2">Ringkasan Bundle:</h4>
            <div class="space-y-1 text-sm">
              <div v-for="item in selectedBundleItems" :key="item.product_id" class="flex justify-between">
                <span>{{ item.product?.name }} ({{ item.quantity }}x)</span>
                <span>Rp {{ ((item.product?.prices?.[0]?.h_jual_b || 0) * item.quantity).toLocaleString('id-ID') }}</span>
              </div>
              <div class="border-t pt-1 font-medium flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {{ bundlePrices.h_jual_b.toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between text-blue-700">
                <span>Pajak ({{ selectedTax?.rate || 0 }}%):</span>
                <span>Rp {{ calculateTaxAmount(bundlePrices.h_jual_b).toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between font-bold text-blue-900">
                <span>Total dengan Pajak:</span>
                <span>Rp {{ (bundlePrices.h_jual_b + calculateTaxAmount(bundlePrices.h_jual_b)).toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="nonBundleProducts.length === 0" class="text-center py-8 text-muted-foreground">
            Tidak ada produk non-bundle tersedia
          </div>
          
          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">Pilih</TableHead>
                <TableHead>Kode Produk</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>DPP Beli</TableHead>
                <TableHead>DPP Jual</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead class="w-20">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in nonBundleProducts" :key="item.id">
                <TableCell>
                  <input 
                    type="checkbox" 
                    :checked="values.bundleItems?.some(p => p.product_id === item.id)" 
                    @change="toggleBundleItem(item.id, ($event.target as HTMLInputElement).checked)"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </TableCell>
                <TableCell class="font-mono text-sm">{{ item.product_code }}</TableCell>
                <TableCell>{{ item.name }}</TableCell>
                <TableCell>Rp {{ Number(item.prices?.[0]?.dpp_beli || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>Rp {{ Number(item.prices?.[0]?.dpp_jual || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>Rp {{ Number(item.prices?.[0]?.h_jual_b || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    :value="values.bundleItems?.find(p => p.product_id === item.id)?.quantity || 1"
                    :disabled="!values.bundleItems?.some(p => p.product_id === item.id)"
                    @input="updateBundleItemQuantity(item.id, Number(($event.target as HTMLInputElement).value))"
                    min="1"
                    class="w-16"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <p v-if="errors.bundleItems" class="text-sm text-red-500">{{ errors.bundleItems }}</p>
        </div>

        <div class="flex justify-end space-x-2">
          <Button type="button" variant="outline" @click="resetForm">
            Reset
          </Button>
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="mr-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            Simpan
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>