<!-- components/orders/components/detail/ConfirmDialog.vue -->

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  open: boolean
  title: string
  description: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="emit('cancel')">Cancel</Button>
        <Button variant="destructive" @click="emit('confirm')">Yes, Confirm</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
