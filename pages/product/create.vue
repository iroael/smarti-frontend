<script setup lang="ts">
import { productFormSchema } from '@/components/product/data/schema'
import { useProducts } from '@/composables/useProducts'
import { useProductTax } from '@/composables/useProductTax'
import { useSuppliers } from '@/composables/useSupplier'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { toast } from 'vue-sonner'

const inventoryTypes = [
  { value: 'INVENTORY', label: 'Persediaan' },
  { value: 'SERVICE', label: 'Jasa' },
  { value: 'NON_INVENTORY', label: 'Non Persediaan' },
  { value: 'GROUP', label: 'Group' },
]

const { createProduct, fetchProductNonBundle, nonBundleProducts } = useProducts()
const { suppliers, loading: suppliersLoading, fetchSuppliers } = useSuppliers()
const { taxes, loading: taxesLoading, fetchTaxes } = useProductTax()

// Loading states
const isSubmitting = ref(false)
const isInitializing = ref(true)

// URL params handling
const getUrlParams = () => {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search).get('type')
  }
  return null
}

const urlType = ref(getUrlParams())
const isBundleFromUrl = computed(() => urlType.value === 'bundling')
const isDisabledSwitch = computed(() => urlType.value !== null)

// Form setup
const schema = toTypedSchema(productFormSchema)

const {
  values,
  errors,
  setFieldValue,
  handleSubmit,
  resetForm,
  validateField,
  validate,
} = useForm({
  validationSchema: schema,
  initialValues: {
    product_code: '',
    name: '',
    description: '',
    inventory_type: 'INVENTORY',
    stock: 0,
    is_bundle: isBundleFromUrl.value || false,
    supplier_id: null,
    tax_id: null,
    weight: 0,
    length: 0,
    height: 0,
    width: 0,
    dimension: '',
    price: {
      dpp_beli: 0,
      dpp_jual: 0,
      h_jual_b: 0,
    },
    bundleItems: [],
  },
})

// Fetch data function
const fetchData = async () => {
  try {
    isInitializing.value = true
    
    await Promise.all([
      fetchProductNonBundle(),
      fetchSuppliers(),
      fetchTaxes(),
    ])
    
    // Wait for next tick to ensure DOM is updated
    await nextTick()
    
    // Set default values after data is loaded
    if (suppliers.value?.length > 0 && !values.supplier_id) {
      setFieldValue('supplier_id', suppliers.value[0].id)
    }

    if (taxes.value?.length > 0 && !values.tax_id) {
      setFieldValue('tax_id', taxes.value[0].id)
    }
    
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Gagal memuat data', {
      description: 'Terjadi kesalahan saat memuat data produk, supplier, atau pajak.'
    })
  } finally {
    isInitializing.value = false
  }
}

// Initialize component
onMounted(async () => {
  await fetchData()
  
  // Set bundle state based on URL
  if (urlType.value === 'bundling') {
    setFieldValue('is_bundle', true)
  } else if (urlType.value === 'nonbundling') {
    setFieldValue('is_bundle', false)
  }
})

// Watch inventory type changes
watch(() => values.inventory_type, (newType) => {
  if (newType !== 'INVENTORY') {
    setFieldValue('stock', 0)
  }
  validateField('stock')
})

// Tax calculations with null checks
const selectedTax = computed(() => {
  if (!taxes.value || taxes.value.length === 0 || !values.tax_id) return null
  return taxes.value.find(t => t.id === values.tax_id) || null
})

const calculateTaxAmount = (base: number) => {
  return selectedTax.value ? (base * selectedTax.value.rate) / 100 : 0
}

// Bundle price calculations with null checks
const bundlePrices = computed(() => {
  if (!values.is_bundle || !values.bundleItems?.length || !nonBundleProducts.value) {
    return { dpp_beli: 0, dpp_jual: 0, h_jual_b: 0 }
  }

  return values.bundleItems.reduce((totals, item) => {
    const product = nonBundleProducts.value.find(p => p.id === item.product_id)
    const price = product?.prices?.[0]
    
    if (!price) return totals
    
    return {
      dpp_beli: totals.dpp_beli + (Number(price.dpp_beli) * item.quantity),
      dpp_jual: totals.dpp_jual + (Number(price.dpp_jual) * item.quantity),
      h_jual_b: totals.h_jual_b + (Number(price.h_jual_b) * item.quantity),
    }
  }, { dpp_beli: 0, dpp_jual: 0, h_jual_b: 0 })
})

// Watch bundle changes with better error handling
watch([() => values.bundleItems, () => values.is_bundle], async () => {
  if (values.is_bundle && !isInitializing.value) {
    try {
      await nextTick()
      const p = bundlePrices.value
      setFieldValue('price.dpp_beli', p.dpp_beli)
      setFieldValue('price.dpp_jual', p.dpp_jual)
      setFieldValue('price.h_jual_b', p.h_jual_b)
    } catch (error) {
      console.error('Error updating bundle prices:', error)
    }
  }
}, { deep: true })

// Combined loading state
const isLoading = computed(() => 
  suppliersLoading.value || 
  taxesLoading.value || 
  isSubmitting.value ||
  isInitializing.value
)

// Form can be submitted check
const canSubmit = computed(() => {
  return !isSubmitting.value && 
         !isInitializing.value && 
         values.name?.trim() && 
         values.product_code?.trim() && 
         values.supplier_id && 
         values.tax_id
})

// Bundle items management with error handling
function toggleBundleItem(product_id: number, checked: boolean) {
  try {
    const currentItems = values.bundleItems || []
    let updatedItems
    
    if (checked) {
      if (!currentItems.some(item => item.product_id === product_id)) {
        updatedItems = [...currentItems, { product_id, quantity: 1 }]
      } else {
        updatedItems = currentItems
      }
    } else {
      updatedItems = currentItems.filter(item => item.product_id !== product_id)
    }

    setFieldValue('bundleItems', updatedItems)
  } catch (error) {
    console.error('Error toggling bundle item:', error)
    toast.error('Gagal mengubah item bundle')
  }
}

function updateBundleItemQuantity(product_id: number, quantity: number) {
  try {
    const updated = (values.bundleItems || []).map(item =>
      item.product_id === product_id
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    )
    setFieldValue('bundleItems', updated)
  } catch (error) {
    console.error('Error updating bundle item quantity:', error)
    toast.error('Gagal mengubah jumlah item bundle')
  }
}

const selectedBundleItems = computed(() => {
  if (!values.bundleItems || !nonBundleProducts.value) return []

  return values.bundleItems
    .map(item => ({
      ...item,
      product: nonBundleProducts.value.find(p => p.id === item.product_id)
    }))
    .filter(item => item.product)
})

// Data preparation untuk submit
const prepareSubmitData = (formData: any) => {
  const submitData = {
    ...formData,
    // Pastikan numeric fields dalam format yang benar
    stock: Number(formData.stock) || 0,
    weight: Number(formData.weight) || 0,
    length: Number(formData.length) || 0,
    height: Number(formData.height) || 0,
    width: Number(formData.width) || 0,
    supplier_id: Number(formData.supplier_id),
    tax_id: Number(formData.tax_id),
    price: {
      dpp_beli: Number(formData.price.dpp_beli) || 0,
      dpp_jual: Number(formData.price.dpp_jual) || 0,
      h_jual_b: Number(formData.price.h_jual_b) || 0,
    },
    // Hanya sertakan bundleItems jika ini adalah bundle product
    ...(formData.is_bundle && {
      bundleItems: formData.bundleItems?.map((item: any) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })) || [],
    }),
  }

  // Remove bundleItems jika bukan bundle
  if (!formData.is_bundle) {
    delete submitData.bundleItems
  }

  return submitData
}

// Form validation sebelum submit
const validateFormData = (data: any) => {
  const errors = []

  // Required field validation
  if (!data.name?.trim()) {
    errors.push('Nama produk wajib diisi')
  }

  if (!data.product_code?.trim()) {
    errors.push('Kode produk wajib diisi')
  }

  if (!data.supplier_id) {
    errors.push('Supplier wajib dipilih')
  }

  if (!data.tax_id) {
    errors.push('Pajak wajib dipilih')
  }

  // Bundle validation
  if (data.is_bundle && (!data.bundleItems || data.bundleItems.length === 0)) {
    errors.push('Produk bundle harus memiliki minimal 1 item')
  }

  // Stock validation
  if (data.inventory_type === 'INVENTORY' && data.stock < 0) {
    errors.push('Stock tidak boleh negatif')
  }

  // Price validation
  if (data.price.dpp_beli < 0 || data.price.dpp_jual < 0 || data.price.h_jual_b < 0) {
    errors.push('Harga tidak boleh negatif')
  }

  return errors
}

// Form submission with better error handling
const onSubmit = handleSubmit(async (data) => {
  try {
    // Set loading state
    isSubmitting.value = true

    // Validate form first
    const { valid } = await validate()
    if (!valid) {
      toast.error('Validasi Form Gagal', {
        description: 'Silakan periksa kembali data yang diisi'
      })
      return
    }

    // Validasi form data
    const validationErrors = validateFormData(data)
    if (validationErrors.length > 0) {
      toast.error('Validasi Gagal', {
        description: validationErrors.join(', ')
      })
      return
    }

    // Persiapkan data untuk submit
    const submitData = prepareSubmitData(data)

    // Kirim data ke server
    const response = await createProduct(submitData)

    if (response) {
      toast.success('Produk berhasil ditambahkan', {
        description: `Produk "${data.name}" telah berhasil disimpan.`
      })

      // Reset form setelah berhasil
      await handleReset()
      // Redirect atau lakukan tindakan lain jika perlu
      // e.g., router.push('/products')
      // return response
    }
    else {
      throw new Error(response?.message || 'Gagal menyimpan produk')
    }
  }
  catch (error) {
    console.error('Error submitting form:', error)
    toast.error('Gagal menyimpan produk', {
      description: error.message || 'Terjadi kesalahan saat menyimpan produk'
    })
  }
  finally {
    // Reset loading state
    isSubmitting.value = false
  }
})

// Function untuk reset form
const handleReset = async () => {
  try {
    await nextTick()
    resetForm()
    
    // Reset ke nilai default berdasarkan URL
    if (urlType.value === 'bundling') {
      setFieldValue('is_bundle', true)
    } else if (urlType.value === 'nonbundling') {
      setFieldValue('is_bundle', false)
    }
    
    // Set default supplier dan tax lagi setelah reset
    if (suppliers.value?.length > 0) {
      setFieldValue('supplier_id', suppliers.value[0].id)
    }
    if (taxes.value?.length > 0) {
      setFieldValue('tax_id', taxes.value[0].id)
    }
    
    toast.info('Form telah direset')
  } catch (error) {
    console.error('Error resetting form:', error)
  }
}

// Expose functions untuk digunakan di template
defineExpose({
  onSubmit,
  handleReset,
  isLoading,
  isSubmitting,
  isInitializing,
  canSubmit,
})
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
            <Label for="inventory_type">Jenis Inventori</Label>
            <Select 
              :model-value="values.inventory_type" 
              @update:modelValue="val => setFieldValue('inventory_type', val)"
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis inventori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="type in inventoryTypes" 
                  :key="type.value" 
                  :value="type.value"
                >
                  {{ type.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="stock">Stok</Label>
            <Input 
              id="stock" 
              type="number" 
              :model-value="values.stock" 
              :disabled="values.inventory_type !== 'INVENTORY'"
              @update:modelValue="val => setFieldValue('stock', Number(val))"
              placeholder="0"
              min="0"
              :class="errors.stock ? 'border-red-500' : ''"
            />
            <p v-if="values.inventory_type !== 'INVENTORY'" class="text-xs text-gray-500">
              Stok hanya berlaku untuk barang (INVENTORY)
            </p>
            <p v-if="errors.stock" class="text-sm text-red-500">{{ errors.stock }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="supplier_id">Supplier <span class="text-red-500">*</span></Label>
            <Select 
              :model-value="values.supplier_id ? values.supplier_id.toString() : ''" 
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
              :model-value="values.tax_id ? values.tax_id.toString() : ''" 
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
          <Label for="description">Deskripsi</Label>
          <Textarea 
            id="description" 
            :model-value="values.description" 
            @update:modelValue="val => setFieldValue('description', val)"
            placeholder="Masukkan deskripsi produk"
            :class="errors.description ? 'border-red-500' : ''"
          />
          <p v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</p>
        </div>

        <!-- Informasi Fisik Produk -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg">Informasi Fisik</h3>
          <div class="grid md:grid-cols-5 gap-4">
            <div class="space-y-2">
              <Label for="weight">Berat (gram)</Label>
              <Input
                id="weight"
                type="number"
                :model-value="values.weight"
                @update:modelValue="val => setFieldValue('weight', Number(val))"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div class="space-y-2">
              <Label for="length">Panjang (cm)</Label>
              <Input
                id="length"
                type="number"
                :model-value="values.length"
                @update:modelValue="val => setFieldValue('length', Number(val))"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div class="space-y-2">
              <Label for="width">Lebar (cm)</Label>
              <Input
                id="width"
                type="number"
                :model-value="values.width"
                @update:modelValue="val => setFieldValue('width', Number(val))"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div class="space-y-2">
              <Label for="height">Tinggi (cm)</Label>
              <Input 
                id="height"
                type="number" 
                :model-value="values.height" 
                @update:modelValue="val => setFieldValue('height', Number(val))"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div class="space-y-2">
              <Label for="dimension">Dimensi</Label>
              <Input 
                id="dimension"
                :model-value="values.dimension" 
                @update:modelValue="val => setFieldValue('dimension', val)"
                placeholder="Contoh: 10x20x30 cm"
              />
            </div>
          </div>
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
          <div v-if="selectedTax" class="p-4 bg-muted rounded-lg">
            <h4 class="font-medium mb-2">Informasi Pajak</h4>
            <div class="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Pajak {{ selectedTax.name }}:</span>
                <p class="font-medium">{{ selectedTax.rate }}%</p>
              </div>
              <div>
                <span class="text-muted-foreground">Pajak dari DPP Beli:</span>
                <p class="font-medium">Rp {{ calculateTaxAmount(values.price.dpp_beli).toLocaleString('id-ID') }}</p>
              </div>
              <div>
                <span class="text-muted-foreground">Pajak dari DPP Jual:</span>
                <p class="font-medium">Rp {{ calculateTaxAmount(values.price.dpp_jual).toLocaleString('id-ID') }}</p>
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
                <span>Total:</span>
                <span>Rp {{ bundlePrices.h_jual_b.toLocaleString('id-ID') }}</span>
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
                <TableCell class="font-medium">{{ item.name }}</TableCell>
                <TableCell>Rp {{ (item.prices?.[0]?.dpp_beli || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>Rp {{ (item.prices?.[0]?.dpp_jual || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>Rp {{ (item.prices?.[0]?.h_jual_b || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>
                  <Input
                    v-if="values.bundleItems?.some(p => p.product_id === item.id)"
                    type="number"
                    :model-value="values.bundleItems?.find(p => p.product_id === item.id)?.quantity || 1"
                    @update:modelValue="val => updateBundleItemQuantity(item.id, Number(val))"
                    min="1"
                    class="w-16"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <!-- Bundle Items Error -->
          <div v-if="values.is_bundle && errors.bundleItems" class="text-sm text-red-500">
            {{ errors.bundleItems }}
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button 
            type="submit" 
            :disabled="!canSubmit"
            class="flex-1 sm:flex-none"
          >
            <div v-if="isSubmitting" class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Menyimpan...</span>
            </div>
            <span v-else>Simpan Produk</span>
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            @click="handleReset"
            :disabled="isSubmitting || isInitializing"
            class="flex-1 sm:flex-none"
          >
            Reset Form
          </Button>
        </div>

        <!-- Success Message -->
        <div v-if="isSubmitting" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center gap-2 text-blue-800">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="font-medium">Menyimpan produk...</span>
          </div>
          <p class="text-sm text-blue-700 mt-1">Mohon tunggu, data sedang diproses.</p>
        </div>
      </form>
    </CardContent>
  </Card>
</template>