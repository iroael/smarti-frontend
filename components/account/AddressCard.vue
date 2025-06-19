<script setup lang="ts">
const props = defineProps<{ data: any, isDefault: boolean }>()
</script>
<template>
  <div class="p-4 border rounded-lg" :class="isDefault ? 'border-green-600' : ''">
    <div class="flex justify-between mb-2">
      <h4 class="font-bold">{{ data.label }}</h4>
      <div>
        <span v-if="isDefault" class="text-green-600 font-semibold">⭐ Utama</span>
        <button class="ml-2 text-gray-500">✏️</button>
        <button class="ml-1 text-red-500">🗑️</button>
      </div>
    </div>
    <p>📞 {{ data.phone }}</p>
    <p>✉️ {{ data.email }}</p>
    <p>📍 {{ data.address }}</p>
    <button
      v-if="!isDefault"
      class="text-green-600 mt-2 hover:underline"
      @click="$emit('make-default')"
    >Jadikan Alamat Utama</button>
  </div>
</template>