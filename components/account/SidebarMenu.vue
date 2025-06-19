<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'navigate', tab: string): void
}>()

const props = defineProps<{
  selected: string
}>()

function selectTab(tab: string) {
  emit('navigate', tab)
}
</script>

<template>
  <div class="space-y-2">
    <button
      class="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
      :class="{ 'bg-green-100 text-green-700 font-semibold': selected === 'profile' }"
      @click="selectTab('profile')"
    >
      Profil Perusahaan
    </button>
    <button
      class="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
      :class="{ 'bg-green-100 text-green-700 font-semibold': selected === 'address' }"
      @click="selectTab('address')"
    >
      Daftar Alamat
    </button>
    <button
      class="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
      :class="{ 'bg-green-100 text-green-700 font-semibold': selected === 'security' }"
      @click="selectTab('security')"
    >
      Keamanan Akun
    </button>
  </div>
</template>
