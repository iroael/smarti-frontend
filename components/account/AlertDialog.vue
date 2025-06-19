<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  title: String,
  description: String
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm')
  close()
}

function handleCancel() {
  emit('cancel')
  close()
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
      <p class="text-sm text-gray-600 mb-4">{{ description }}</p>
      <div class="flex justify-end gap-2">
        <button @click="handleCancel" class="px-4 py-2 bg-gray-200 rounded">Batal</button>
        <button @click="handleConfirm" class="px-4 py-2 bg-green-600 text-white rounded">Ya</button>
      </div>
    </div>
  </div>
</template>
