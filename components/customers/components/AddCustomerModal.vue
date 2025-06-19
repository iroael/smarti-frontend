<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: any): void
}>()

const props = defineProps<{ open: boolean }>()

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  npwp: '',
  address: '',
})

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>

<template>
  <Dialog :open="open" @close="emit('close')">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add Customer</DialogTitle>
        <DialogDescription>
          Fill in the form to create a new customer.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <Input v-model="form.name" placeholder="Name" />
        <Input v-model="form.email" placeholder="Email" type="email" />
        <Input v-model="form.password" placeholder="Password" type="password" />
        <Input v-model="form.phone" placeholder="Phone" />
        <Input v-model="form.npwp" placeholder="NPWP" />
        <Textarea v-model="form.address" placeholder="Address" />
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('close')">Cancel</Button>
        <Button @click="handleSubmit">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
