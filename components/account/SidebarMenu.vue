<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'navigate', tab: string): void
}>()

const props = defineProps<{
  selected: string
}>()

// Tab configuration for easier maintenance
const tabs = [
  { key: 'profile', label: 'Profil Perusahaan', icon: '🏢' },
  { key: 'address', label: 'Daftar Alamat', icon: '📍' },
  { key: 'taxes', label: 'Data Pajak', icon: '💰' },
  { key: 'security', label: 'Keamanan Akun', icon: '🔒' },
]

function selectTab(tab: string) {
  emit('navigate', tab)
}
</script>

<template>
  <div class="space-y-2">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
      :class="{ 
        'bg-green-100 text-green-700 font-semibold border-l-4 border-green-500': selected === tab.key,
        'text-gray-700': selected !== tab.key
      }"
      @click="selectTab(tab.key)"
    >
      <span class="text-lg">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>