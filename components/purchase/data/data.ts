import { Icon } from '#components'
import { h } from 'vue'

export const purchaseOrderLabels = [
  {
    value: 'raw_material',
    label: 'Raw Material',
  },
  {
    value: 'office_supply',
    label: 'Office Supply',
  },
  {
    value: 'equipment',
    label: 'Equipment',
  },
  {
    value: 'service',
    label: 'Service',
  },
]

export const purchaseOrderStatuses = [
  {
    value: 'pending',
    label: 'Pending',
    icon: h(Icon, { name: 'i-radix-icons-clock' }),
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    icon: h(Icon, { name: 'i-radix-icons-stopwatch' }),
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: h(Icon, { name: 'i-radix-icons-check-circled' }),
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: h(Icon, { name: 'i-radix-icons-cross-circled' }),
  },
  {
    value: 'shipped',
    label: 'Shipped',
    icon: h(Icon, { name: 'i-radix-icons-truck' }),
  },
]

export const purchaseOrderPriorities = [
  {
    value: 'low',
    label: 'Low',
    icon: h(Icon, { name: 'i-radix-icons-arrow-down' }),
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: h(Icon, { name: 'i-radix-icons-dash' }),
  },
  {
    value: 'high',
    label: 'High',
    icon: h(Icon, { name: 'i-radix-icons-arrow-up' }),
  },
  {
    value: 'urgent',
    label: 'Urgent',
    icon: h(Icon, { name: 'i-radix-icons-exclamation-triangle' }),
  },
]

// Additional useful constants
export const paymentTerms = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
]

export const shippingMethods = [
  { value: 'ground', label: 'Ground' },
  { value: 'air', label: 'Air' },
  { value: 'sea', label: 'Sea' },
  { value: 'pickup', label: 'Pickup' },
]
