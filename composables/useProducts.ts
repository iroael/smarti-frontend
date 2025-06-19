import { productListSchema, productSchema, type Product } from '@/components/product/data/schema'
import { useFetch } from '#app'
import { useRuntimeConfig } from '#imports'
import { ref } from 'vue'

const bundleProducts = ref<Product[]>([])
const products = ref([])
const loading = ref(false)

export function useProducts() {
  const config = useRuntimeConfig()

  const fetchProducts = async () => {
    loading.value = true
    try {
      const { data } = await useFetch(`${config.public.apiBase}/products`, {
        method: 'GET',
        headers: authHeaders(),
      })
      products.value = data.value?.data ?? []
      console.log('Fetched products:', products.value)
    }
    finally {
      loading.value = false
    }
  }

  const getProductById = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products/${id}`, {
      method: 'GET',
      headers: authHeaders(),
    })
    if (error.value)
      throw error.value
    return data.value
  }

  const createProduct = async (payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    if (error.value)
      throw error.value
    return data.value
  }

  const updateProduct = async (id: number, payload: any) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    if (error.value)
      throw error.value
    return data.value
  }

  const deleteProduct = async (id: number) => {
    const { data, error } = await useFetch(`${config.public.apiBase}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (error.value)
      throw error.value
    return data.value
  }

  const nonBundleProducts = ref([])

  const fetchProductNonBundle = async () => {
    loading.value = true
    try {
      const { data } = await useFetch(`${config.public.apiBase}/products`, {
        method: 'GET',
        headers: authHeaders(),
      })
      const all = data.value?.data ?? []
      nonBundleProducts.value = all.filter((p: any) => p.is_bundle === false)
      console.log('Fetched non-bundle products:', nonBundleProducts.value)
      if (nonBundleProducts.value.length === 0) {
        console.warn('No non-bundle products found')
      }
    }
    finally {
      loading.value = false
    }
  }

  const fetchBundleProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await useFetch(`${config.public.apiBase}/products`, {
        method: 'GET',
        headers: authHeaders(),
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

  return {
    products,
    loading,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProductNonBundle,
    fetchBundleProducts,
    bundleProducts,
    nonBundleProducts,
  }
}

function authHeaders() {
  return {
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTc1MDIxMTkxMywiZXhwIjoxNzUwMjk4MzEzfQ.AMoMtg_InX_rdWO2wnFixNdB1uGcSzoBxJGK82OBXig',
    Accept: 'application/json',
  }
}
