
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref, watch } from 'vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'submit', payload: { courierName: string; trackingNumber: string }): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  courierName: '',
  trackingNumber: '',
})

// Reset form ketika modal terbuka
watch(() => props.open, (val) => {
  if (val) {
    form.value = {
      courierName: '',
      trackingNumber: '',
    }
  }
})

const onSubmit = () => {
  emit('submit', { ...form.value })
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Dialog :open="open" @close="onCancel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Shipping Information</DialogTitle>
        <DialogDescription>
          Fill out courier and tracking number to proceed with shipment.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div>
          <Label>Courier Name</Label>
          <Input v-model="form.courierName" placeholder="e.g., JNE, SiCepat, etc." />
        </div>
        <div>
          <Label>Tracking Number</Label>
          <Input v-model="form.trackingNumber" placeholder="e.g., JNE123456789" />
        </div>
      </div>

      <DialogFooter class="mt-4">
        <Button variant="outline" @click="onCancel">Cancel</Button>
        <Button @click="onSubmit" :disabled="!form.courierName || !form.trackingNumber">
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
