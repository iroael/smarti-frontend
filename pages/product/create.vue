<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useProducts } from '@/composables/useProducts'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const { createProduct, fetchProductNonBundle, nonBundleProducts } = useProducts()
await fetchProductNonBundle()

const schema = toTypedSchema(z.object({
  product_code: z.string().min(1, 'Kode produk wajib diisi'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  stock: z.number().min(0),
  is_bundle: z.boolean(),
  supplier_id: z.number().min(1),
  price: z.object({
    dpp_beli: z.number(),
    dpp_jual: z.number(),
    h_jual_b: z.number(),
  }),
  bundleItems: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1),
  })).optional(),
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
    is_bundle: false,
    supplier_id: 1,
    price: {
      dpp_beli: 0,
      dpp_jual: 0,
      h_jual_b: 0,
    },
    bundleItems: []
  },
})

// Saat item bundle dipilih
function toggleBundleItem(product_id: number, checked: boolean) {
  const current = new Map(values.bundleItems?.map(item => [item.product_id, item]) ?? [])
  if (checked) {
    current.set(product_id, { product_id, quantity: 1 })
  }
  else {
    current.delete(product_id)
  }
  setFieldValue('bundleItems', Array.from(current.values()))
}

// Perhitungan harga total (opsional)
const totalPrice = computed(() => {
  if (!values.is_bundle || !values.bundleItems)
    return 0
  return values.bundleItems.reduce((sum, item) => {
    const found = nonBundleProducts.value.find(p => p.id === item.product_id)
    return sum + (found?.price?.dpp_jual ? Number(found.price.dpp_jual) : 0)
  }, 0)
})

// Auto disable input harga saat bundle
watch(() => values.is_bundle, val => {
  if (val) {
    setFieldValue('price', {
      dpp_beli: 0,
      dpp_jual: 0,
      h_jual_b: 0,
    })
  }
})

// Submit
const onSubmit = handleSubmit(async (data) => {
  try {
    await createProduct(data)
    toast.success('Produk berhasil disimpan!')
    resetForm()
  }
  catch (e: any) {
    toast.error('Gagal menyimpan', {
      description: e?.data?.message || e.message || 'Terjadi kesalahan.'
    })
  }
})
</script>
<template>
  <Card>
    <CardHeader>
      <CardTitle>Tambah Produk</CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="onSubmit" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="product_code">Kode Produk</Label>
            <Input id="product_code" :model-value="values.product_code" @update:modelValue="val => setFieldValue('product_code', val)" />
            <p v-if="errors.product_code" class="text-sm text-red-500">{{ errors.product_code }}</p>
          </div>
          <div class="space-y-2">
            <Label for="name">Nama Produk</Label>
            <Input id="name" :model-value="values.name" @update:modelValue="val => setFieldValue('name', val)" />
            <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
          </div>
          <div class="space-y-2">
            <Label for="stock">Stok</Label>
            <Input id="stock" type="number" :model-value="values.stock" @update:modelValue="val => setFieldValue('stock', val)" />
            <p v-if="errors.stock" class="text-sm text-red-500">{{ errors.stock }}</p>
          </div>
          <div class="space-y-2">
            <Label for="supplier_id">Supplier ID</Label>
            <Input id="supplier_id" type="number" :model-value="values.supplier_id" @update:modelValue="val => setFieldValue('supplier_id', val)" />
          </div>
          <div class="space-y-2">
            <Label>Produk Bundle?</Label>
            <Switch :checked="values.is_bundle" @update:checked="val => setFieldValue('is_bundle', val)" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Deskripsi</Label>
          <Textarea id="description" :model-value="values.description" @update:modelValue="val => setFieldValue('description', val)" />
          <p v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</p>
        </div>

        <!-- Harga -->
        <div class="grid md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>DPP Beli</Label>
            <Input type="number" :model-value="values.price.dpp_beli" :disabled="values.is_bundle" @update:modelValue="val => setFieldValue('price.dpp_beli', Number(val))" />
          </div>
          <div class="space-y-2">
            <Label>DPP Jual</Label>
            <Input type="number" :model-value="values.price.dpp_jual" :disabled="values.is_bundle" @update:modelValue="val => setFieldValue('price.dpp_jual', Number(val))" />
          </div>
          <div class="space-y-2">
            <Label>Harga Jual</Label>
            <Input type="number" :model-value="values.price.h_jual_b" :disabled="values.is_bundle" @update:modelValue="val => setFieldValue('price.h_jual_b', Number(val))" />
          </div>
        </div>

        <!-- Bundle -->
        <div v-if="values.is_bundle" class="space-y-4">
          <h3 class="font-semibold text-lg">Item dalam Bundle</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Checklist</TableHead>
                <TableHead>Kode Produk</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>DPP Beli</TableHead>
                <TableHead>DPP Jual</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in nonBundleProducts" :key="item.id">
                <TableCell>
                  <input type="checkbox" :checked="values.bundleItems?.some(p => p.product_id === item.id)" @change="toggleBundleItem(item.id, $event.target.checked)" />
                </TableCell>
                <TableCell>{{ item.product_code }}</TableCell>
                <TableCell>{{ item.name }}</TableCell>
                <TableCell>Rp {{ Number(item.prices?.[0]?.dpp_beli || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>Rp {{ Number(item.prices?.[0]?.dpp_jual || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>Rp {{ Number(item.prices?.[0]?.h_jual_b || 0).toLocaleString('id-ID') }}</TableCell>
                <TableCell>
                  <span>1</span> <!-- Quantity default 1 (readonly) -->
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="flex justify-end">
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
