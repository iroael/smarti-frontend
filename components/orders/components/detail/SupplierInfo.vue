<script setup lang="ts">
import { Building2, User, Mail, Phone, MapPin, FileText, Globe } from 'lucide-vue-next'

interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: Address
  taxId?: string
  website?: string
}

interface Props {
  supplier: Supplier
}

defineProps<Props>()
</script>

<template>
  <div class="bg-card rounded-lg border shadow-sm p-6">
    <div class="flex items-center gap-3 mb-6">
      <Building2 class="h-5 w-5 text-primary" />
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        Supplier Information
      </h3>
    </div>

    <div class="space-y-5">
      <!-- Supplier Name -->
      <div class="grid gap-1">
        <label class="text-sm font-medium text-muted-foreground">Company Name</label>
        <p class="text-sm font-medium">{{ supplier.name }}</p>
      </div>

      <!-- Contact Person -->
      <div v-if="supplier.contactPerson" class="grid gap-1">
        <div class="flex items-center gap-2 text-muted-foreground">
          <User class="h-4 w-4" />
          <label class="text-sm font-medium">Contact Person</label>
        </div>
        <p class="text-sm">{{ supplier.contactPerson }}</p>
      </div>

      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div v-if="supplier.email" class="grid gap-1">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Mail class="h-4 w-4" />
            <label class="text-sm font-medium">Email</label>
          </div>
          <p class="text-sm">
            <a 
              :href="`mailto:${supplier.email}`" 
              class="hover:text-primary hover:underline"
            >
              {{ supplier.email }}
            </a>
          </p>
        </div>

        <div v-if="supplier.phone" class="grid gap-1">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Phone class="h-4 w-4" />
            <label class="text-sm font-medium">Phone</label>
          </div>
          <p class="text-sm">
            <a 
              :href="`tel:${supplier.phone}`" 
              class="hover:text-primary hover:underline"
            >
              {{ supplier.phone }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
