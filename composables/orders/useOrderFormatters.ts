// composables/useOrderFormatters.ts
export const useOrderFormatters = () => {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const getStatusClass = (status: string) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusClass = (status: string) => {
    const classes = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      failed: 'bg-red-500'
    }
    return classes[status as keyof typeof classes] || 'bg-gray-500'
  }

  const getPaymentStatusTextClass = (status: string) => {
    const classes = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600'
    }
    return classes[status as keyof typeof classes] || 'text-gray-600'
  }

  const getShippingStatusClass = (status: string) => {
    const classes = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    }
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
  }

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    capitalizeFirst,
    getStatusClass,
    getPaymentStatusClass,
    getPaymentStatusTextClass,
    getShippingStatusClass
  }
}
