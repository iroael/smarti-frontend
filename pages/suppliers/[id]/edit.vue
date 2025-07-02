<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useSuppliers } from '~/composables/useSupplier'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const { loading, getSupplierById, updateSupplier } = useSuppliers()

const form = ref({
  supplier_code: '',
  kategori: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  province: '',
  city: '',
  postalcode: '',
  astat: true,
  tax: {
    taxType: 'npwp',
    taxNumber: '',
    taxName: '',
    registeredAddress: '',
    isActive: true,
    isPrimary: false
  },
  bankAccounts: [{
    bankName: '',
    accountNumber: '',
    accountName: '',
    branch: '',
    isPrimary: true
  }]
})

const fetchSupplier = async () => {
  try {
    const id = Number(route.params.id)
    const data = await getSupplierById(id)
    form.value = {
      supplier_code: data.supplier_code,
      kategori: data.kategori || '',
      name: data.name,
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      province: data.province || '',
      city: data.city || '',
      postalcode: data.postalcode || '',
      astat: data.astat,
      tax: data.tax ? {
        taxType: data.tax.taxType || 'npwp',
        taxNumber: data.tax.taxNumber || '',
        taxName: data.tax.taxName || '',
        registeredAddress: data.tax.registeredAddress || '',
        isActive: data.tax.isActive,
        isPrimary: data.tax.isPrimary || false
      } : {
        taxType: 'npwp',
        taxNumber: '',
        taxName: '',
        registeredAddress: '',
        isActive: true,
        isPrimary: false
      },
      bankAccounts: data.bankAccounts && data.bankAccounts.length > 0 
        ? data.bankAccounts.map(acc => ({
            bankName: acc.bankName || '',
            accountNumber: acc.accountNumber || '',
            accountName: acc.accountName || '',
            branch: acc.branch || '',
            isPrimary: acc.isPrimary || false
          }))
        : [{
            bankName: '',
            accountNumber: '',
            accountName: '',
            branch: '',
            isPrimary: true
          }]
    }
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to load supplier data',
      variant: 'destructive',
    })
    router.push('/suppliers')
  }
}

const submitForm = async () => {
  try {
    const id = Number(route.params.id)
    await updateSupplier(id, form.value)
    toast({
      title: 'Success',
      description: 'Supplier updated successfully',
    })
    router.push(`/suppliers/${id}`)
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to update supplier',
      variant: 'destructive',
    })
  }
}

const addBankAccount = () => {
  form.value.bankAccounts.push({
    bankName: '',
    accountNumber: '',
    accountName: '',
    branch: '',
    isPrimary: false
  })
}

const removeBankAccount = (index: number) => {
  if (form.value.bankAccounts.length > 1) {
    form.value.bankAccounts.splice(index, 1)
  }
}

const setPrimaryBankAccount = (index: number) => {
  form.value.bankAccounts.forEach((acc, i) => {
    acc.isPrimary = i === index
  })
}

onMounted(() => {
  fetchSupplier()
})
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold tracking-tight">Edit Supplier</h1>
      <Button variant="outline" @click="router.push(`/suppliers/${route.params.id}`)">
        Cancel
      </Button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Basic Information -->
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label for="supplier_code">Supplier Code</Label>
            <Input id="supplier_code" v-model="form.supplier_code" disabled />
          </div>
          
          <div class="space-y-2">
            <Label for="kategori">Category</Label>
            <Select v-model="form.kategori">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vendor">Vendor</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
                <SelectItem value="Distributor">Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" required />
          </div>
          
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="form.email" type="email" />
          </div>
          
          <div class="space-y-2">
            <Label for="phone">Phone</Label>
            <Input id="phone" v-model="form.phone" />
          </div>
          
          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Input id="address" v-model="form.address" />
          </div>
          
          <div class="space-y-2">
            <Label for="province">Province</Label>
            <Input id="province" v-model="form.province" />
          </div>
          
          <div class="space-y-2">
            <Label for="city">City</Label>
            <Input id="city" v-model="form.city" />
          </div>
          
          <div class="space-y-2">
            <Label for="postalcode">Postal Code</Label>
            <Input id="postalcode" v-model="form.postalcode" />
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox id="astat" v-model:checked="form.astat" />
            <Label for="astat">Active Supplier</Label>
          </div>
        </CardContent>
      </Card>

      <!-- Tax Information -->
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label for="taxType">Tax Type</Label>
            <Select v-model="form.tax.taxType">
              <SelectTrigger>
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="npwp">NPWP</SelectItem>
                <SelectItem value="nik">NIK</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="taxNumber">Tax Number</Label>
            <Input id="taxNumber" v-model="form.tax.taxNumber" />
          </div>
          
          <div class="space-y-2">
            <Label for="taxName">Tax Name</Label>
            <Input id="taxName" v-model="form.tax.taxName" />
          </div>
          
          <div class="space-y-2">
            <Label for="registeredAddress">Registered Address</Label>
            <Input id="registeredAddress" v-model="form.tax.registeredAddress" />
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox id="taxActive" v-model:checked="form.tax.isActive" />
            <Label for="taxActive">Active Tax</Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox id="taxPrimary" v-model:checked="form.tax.isPrimary" />
            <Label for="taxPrimary">Primary Tax</Label>
          </div>
        </CardContent>
      </Card>

      <!-- Bank Accounts -->
      <Card>
        <CardHeader>
          <div class="flex justify-between items-center">
            <CardTitle>Bank Accounts</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addBankAccount">
              Add Bank Account
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div v-for="(account, index) in form.bankAccounts" :key="index" class="border rounded-lg p-4 space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-medium">Bank Account {{ index + 1 }}</h3>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                @click="removeBankAccount(index)"
                :disabled="form.bankAccounts.length <= 1"
              >
                Remove
              </Button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label :for="`bankName-${index}`">Bank Name</Label>
                <Input :id="`bankName-${index}`" v-model="account.bankName" />
              </div>
              
              <div class="space-y-2">
                <Label :for="`accountNumber-${index}`">Account Number</Label>
                <Input :id="`accountNumber-${index}`" v-model="account.accountNumber" />
              </div>
              
              <div class="space-y-2">
                <Label :for="`accountName-${index}`">Account Name</Label>
                <Input :id="`accountName-${index}`" v-model="account.accountName" />
              </div>
              
              <div class="space-y-2">
                <Label :for="`branch-${index}`">Branch</Label>
                <Input :id="`branch-${index}`" v-model="account.branch" />
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox 
                  :id="`isPrimary-${index}`" 
                  :checked="account.isPrimary" 
                  @update:checked="setPrimaryBankAccount(index)"
                />
                <Label :for="`isPrimary-${index}`">Primary Account</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-2">
        <Button type="button" variant="outline" @click="router.push(`/suppliers/${route.params.id}/view`)">
          Cancel
        </Button>
        <Button type="submit" :disabled="loading">
          Save Changes
        </Button>
      </div>
    </form>
  </div>
</template>