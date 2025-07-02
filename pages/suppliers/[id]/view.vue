<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useSuppliers } from '~/composables/useSupplier'
import { useToast } from '@/components/ui/toast/use-toast'
import { ArrowLeft, Edit3, Trash2, Building2, CreditCard, Receipt } from 'lucide-vue-next'

const route = useRoute()
const { toast } = useToast()
const { loading, getSupplierById } = useSuppliers()

const supplier = ref(null)
const error = ref(null)

const fetchSupplier = async () => {
  try {
    const id = Number(route.params.id)
    supplier.value = await getSupplierById(id)
  } catch (err) {
    error.value = err
    toast({
      title: 'Error',
      description: 'Failed to load supplier data',
      variant: 'destructive',
    })
  }
}

const handleDelete = () => {
  // Add delete confirmation logic here
  toast({
    title: 'Delete Supplier',
    description: 'This feature will be implemented soon',
    variant: 'default',
  })
}

onMounted(() => {
  fetchSupplier()
})
</script>

<template>
  <div class="container mx-auto space-y-6">
    <!-- Header Section with Actions -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight">Supplier Details</h1>
        <p class="text-muted-foreground">
          View and manage supplier information
        </p>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant="outline" @click="$router.go(-1)" class="order-3 sm:order-1">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Suppliers
        </Button>
        
        <div v-if="supplier && !loading" class="flex gap-2 order-1 sm:order-2">
          <Button 
            variant="default" 
            @click="$router.push(`/suppliers/${supplier.id}/edit`)"
            class="flex-1 sm:flex-none"
          >
            <Edit3 class="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            @click="handleDelete"
            class="flex-1 sm:flex-none"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>

    <Separator />

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div class="space-y-4">
        <Skeleton class="h-8 w-1/3" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-48 w-full" />
    </div>

    <!-- Error State -->
    <Card v-else-if="error" class="border-destructive">
      <CardContent class="pt-6">
        <div class="flex items-center space-x-2 text-destructive">
          <div class="text-sm font-medium">Error loading supplier data</div>
        </div>
        <p class="text-sm text-muted-foreground mt-1">{{ error.message }}</p>
      </CardContent>
    </Card>

    <!-- Content -->
    <div v-else-if="supplier" class="space-y-6">
      <!-- Supplier Header Card -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-2">
              <CardTitle class="text-2xl flex items-center gap-3 flex-wrap">
                <Building2 class="w-6 h-6 text-blue-600" />
                {{ supplier.name }}
                <Badge variant="outline" class="text-xs">
                  {{ supplier.supplier_code }}
                </Badge>
              </CardTitle>
              <Badge 
                :variant="supplier.astat ? 'default' : 'secondary'" 
                class="w-fit"
              >
                {{ supplier.astat ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
            <div class="text-sm text-muted-foreground">
              Created: {{ new Date(supplier.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) }}
            </div>
          </div>
        </CardHeader>
      </Card>

      <!-- Basic Information Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Building2 class="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Category</h3>
              <p class="text-base">{{ supplier.kategori || 'Not specified' }}</p>
            </div>
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Phone</h3>
              <p class="text-base">{{ supplier.phone || 'Not provided' }}</p>
            </div>
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email</h3>
              <p class="text-base">{{ supplier.email || 'Not provided' }}</p>
            </div>
            <div class="space-y-2 md:col-span-2 xl:col-span-3">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address</h3>
              <p class="text-base">{{ supplier.address || 'Not provided' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Tax Information Card -->
      <Card v-if="supplier.tax">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Receipt class="w-5 h-5" />
            Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tax Type</h3>
              <p class="text-base">{{ supplier.tax.taxType || 'Not specified' }}</p>
            </div>
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tax Number</h3>
              <p class="text-base font-mono">{{ supplier.tax.taxNumber || 'Not provided' }}</p>
            </div>
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tax Name</h3>
              <p class="text-base">{{ supplier.tax.taxName || 'Not provided' }}</p>
            </div>
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h3>
              <Badge :variant="supplier.tax.isActive ? 'default' : 'secondary'">
                {{ supplier.tax.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
            <div class="space-y-2 md:col-span-2">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Registered Address</h3>
              <p class="text-base">{{ supplier.tax.registeredAddress || 'Not provided' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Bank Accounts Card -->
      <Card v-if="supplier.bankAccounts && supplier.bankAccounts.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Bank Accounts
            <Badge variant="outline">{{ supplier.bankAccounts.length }}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="(account, index) in supplier.bankAccounts"
            :key="account.id"
            class="relative border rounded-lg p-4 transition-colors hover:bg-muted/20"
            :class="{ 
              'border-primary bg-primary/5': account.isPrimary,
              'border-border': !account.isPrimary 
            }"
          >
            <div v-if="account.isPrimary" class="absolute top-2 right-2">
              <Badge variant="default" class="text-xs">Primary</Badge>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pr-16 md:pr-4">
              <div class="space-y-1">
                <h3 class="text-sm font-medium text-muted-foreground">Bank Name</h3>
                <p class="text-base font-medium">{{ account.bankName || 'Not specified' }}</p>
              </div>
              <div class="space-y-1">
                <h3 class="text-sm font-medium text-muted-foreground">Account Number</h3>
                <p class="text-base font-mono">{{ account.accountNumber || 'Not provided' }}</p>
              </div>
              <div class="space-y-1">
                <h3 class="text-sm font-medium text-muted-foreground">Account Name</h3>
                <p class="text-base">{{ account.accountName || 'Not provided' }}</p>
              </div>
              <div class="space-y-1">
                <h3 class="text-sm font-medium text-muted-foreground">Branch</h3>
                <p class="text-base">{{ account.branch || 'Not specified' }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Empty State for Bank Accounts -->
      <Card v-else>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8 text-muted-foreground">
            <CreditCard class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bank accounts registered for this supplier</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>