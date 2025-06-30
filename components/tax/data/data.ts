import { Icon } from '#components'
import { h } from 'vue'

// Optional - jenis dokumen atau label administratif
export const labels = [
  {
    value: 'pajak-ppn',
    label: 'PPN',
  },
  {
    value: 'pajak-pph',
    label: 'PPh',
  },
  {
    value: 'pajak-bumi-bangunan',
    label: 'PBB',
  },
]

// Status pajak: apakah sudah dibayar, pending, dll.
export const statuses = [
  {
    value: 'draft',
    label: 'Draft',
    icon: h(Icon, { name: 'i-radix-icons-pencil-2' }),
  },
  {
    value: 'submitted',
    label: 'Submitted',
    icon: h(Icon, { name: 'i-radix-icons-upload' }),
  },
  {
    value: 'paid',
    label: 'Paid',
    icon: h(Icon, { name: 'i-radix-icons-check-circled' }),
  },
  {
    value: 'overdue',
    label: 'Overdue',
    icon: h(Icon, { name: 'i-radix-icons-clock' }),
  },
]

// Jika kamu ingin kategorisasi atau jenis pajak
export const taxTypes = [
  {
    value: 'ppn',
    label: 'PPN',
    icon: h(Icon, { name: 'i-lucide-file-text' }),
  },
  {
    value: 'pph',
    label: 'PPh',
    icon: h(Icon, { name: 'i-lucide-file-text' }),
  },
  {
    value: 'pbb',
    label: 'PBB',
    icon: h(Icon, { name: 'i-lucide-file-text' }),
  },
]
