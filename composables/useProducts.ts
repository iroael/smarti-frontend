import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { productListSchema, productSchema, type Product } from '@/components/product/data/schema'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const bundleProducts = ref<Product[]>([])
const products = ref<Product[]>([])
const nonBundleProducts = ref<Product[]>([])
const loading = ref(false)

export function useProducts() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    // Get token from auth store
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return headers
  }

  // Enhanced function to fetch products based on role with proper endpoints
  const fetchProductsByRole = async () => {
    loading.value = true
    try {
      const userRole = authStore.user?.role
      let endpoint = `${config.public.apiBase}/products`
      
      // Use specific endpoints based on role for better API alignment
      if (userRole === 'supplier') {
        // Suppliers see their own products by default
        endpoint = `${config.public.apiBase}/products/my`
      } else if (userRole === 'customer') {
        // Customers see catalog products (from other suppliers they have access to)
        endpoint = `${config.public.apiBase}/products/catalog`
      }
      // Admin and other roles use the default endpoint

      const { data, error } = await useFetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value

      const parsed = productListSchema.parse(data.value)
      const allProducts = parsed.data ?? []

      // Additional client-side filtering for customers (bundle products only)
      if (userRole === 'customer') {
        products.value = allProducts.filter((p) => p.is_bundle === true)
        console.log('Fetched bundle products for customer:', products.value)
      } else {
        products.value = allProducts
        console.log(`Fetched products for ${userRole}:`, products.value)
      }

      if (products.value.length === 0) {
        console.warn(userRole === 'customer' 
          ? 'Tidak ada produk bundle ditemukan.' 
          : 'Tidak ada produk ditemukan.')
      }
    } catch (err) {
      console.error('Gagal mengambil produk:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Legacy function - kept for backward compatibility
  const fetchProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/products`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value

      const parsed = productListSchema.parse(data.value)
      const allProducts = parsed.data ?? []

      // Filter berdasarkan role user
      if (authStore.user?.role === 'customer') {
        // Hanya tampilkan bundle products untuk customer
        products.value = allProducts.filter((p) => p.is_bundle === true)
        console.log('Fetched bundle products for customer:', products.value)
      } else {
        // Tampilkan semua produk untuk role lain (admin, etc.)
        products.value = allProducts
        console.log('Fetched all products for admin:', products.value)
      }
      
      if (products.value.length === 0) {
        console.warn(authStore.user?.role === 'customer' 
          ? 'Tidak ada produk bundle ditemukan.' 
          : 'Tidak ada produk ditemukan.')
      }
    } catch (err) {
      console.error('Gagal mengambil produk:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch catalog products (for customers to see products from suppliers they have access to)
  const fetchCatalogProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/products/catalog`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value

      const parsed = productListSchema.parse(data.value)
      products.value = parsed.data ?? []
      
      console.log('Fetched catalog products:', products.value)
      
      if (products.value.length === 0) {
        console.warn('Tidak ada produk katalog ditemukan.')
      }
    } catch (err) {
      console.error('Gagal mengambil produk katalog:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch supplier's own products
  const fetchMyProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/products/my`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value

      const parsed = productListSchema.parse(data.value)
      products.value = parsed.data ?? []
      
      console.log('Fetched my products:', products.value)
      
      if (products.value.length === 0) {
        console.warn('Tidak ada produk saya ditemukan.')
      }
    } catch (err) {
      console.error('Gagal mengambil produk saya:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getProductById = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    if (error.value) throw error.value
    return data.value
  }

  const createProduct = async (payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    if (error.value) throw error.value
    return data.value
  }

  const updateProduct = async (id: number, payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    if (error.value) throw error.value
    return data.value
  }

  const deleteProduct = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (error.value) throw error.value
    return data.value
  }

  const fetchProductNonBundle = async () => {
    loading.value = true
    try {
      const { data } = await useFetch(`${config.public.apiBase}/products/admin/all`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const all = data.value?.data ?? []
      nonBundleProducts.value = all.filter((p: any) => p.is_bundle === false)
      console.log('Fetched non-bundle products:', nonBundleProducts.value)
      if (nonBundleProducts.value.length === 0) {
        console.warn('No non-bundle products found')
      }
    } finally {
      loading.value = false
    }
  }

  const fetchBundleProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/products/admin/all`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value
      
      const parsed = productListSchema.parse(data.value)
      bundleProducts.value = parsed.data.filter((p) => p.is_bundle === true)
      
      if (bundleProducts.value.length === 0) {
        console.warn('Tidak ada produk bundle ditemukan.')
      }
    } catch (err) {
      console.error('Gagal mengambil produk bundle:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch products from specific supplier
  const fetchProductsBySupplier = async (supplierId: number) => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/products/supplier/${supplierId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (error.value) throw error.value

      const parsed = productListSchema.parse(data.value)
      products.value = parsed.data ?? []
      
      console.log(`Fetched products from supplier ${supplierId}:`, products.value)
      
      if (products.value.length === 0) {
        console.warn(`Tidak ada produk dari supplier ${supplierId} ditemukan.`)
      }
    } catch (err) {
      console.error(`Gagal mengambil produk dari supplier ${supplierId}:`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    products,
    bundleProducts,
    nonBundleProducts,
    loading,
    
    // Main functions
    fetchProductsByRole, // Recommended: Use this for role-based fetching
    fetchProducts, // Legacy: Kept for backward compatibility
    
    // Specific functions
    fetchCatalogProducts,
    fetchMyProducts,
    fetchBundleProducts,
    fetchProductNonBundle,
    fetchProductsBySupplier,
    
    // CRUD operations
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}