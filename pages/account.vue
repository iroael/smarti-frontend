<script setup lang="ts">
import AccountSecurity from '@/components/account/AccountSecurity.vue'
import AddressList from '@/components/account/AddressList.vue'
import CompanyProfile from '@/components/account/CompanyProfile.vue'
import TaxPage from '@/components/account/TaxPage.vue'
import SidebarMenu from '@/components/account/SidebarMenu.vue'
import { User, Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'

const activeTab = ref('profile')
</script>

<template>

  <!-- Header -->
  <div class="bg-white border-b">
    <div class="container px-4 py-4">
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
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
    <div class="col-span-1">
      <SidebarMenu :selected="activeTab" @navigate="activeTab = $event" />
    </div>
    <div class="col-span-1 md:col-span-3 space-y-6">
      <CompanyProfile v-if="activeTab === 'profile'" />
      <AddressList v-if="activeTab === 'address'" />
      <TaxPage v-if="activeTab === 'taxes'" />
      <AccountSecurity v-if="activeTab === 'security'" />
    </div>
  </div>
</template>