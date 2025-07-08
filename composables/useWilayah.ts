import { ref, watch } from 'vue'

interface WilayahItem {
  code: string
  name: string
}

interface WilayahResponse {
  data: WilayahItem[]
  meta: {
    administrative_area_level: number
    updated_at: string
  }
}

interface WilayahOptions {
  cacheEnabled?: boolean
}

export const useWilayah = (options: WilayahOptions = {}) => {
  const { cacheEnabled = true } = options
  
  const provinces = ref<WilayahItem[]>([])
  const regencies = ref<WilayahItem[]>([])
  const districts = ref<WilayahItem[]>([])
  const villages = ref<WilayahItem[]>([])
  
  const loading = ref({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
  })

  const selected = ref({
    province: '',
    regency: '',
    district: '',
    village: '',
  })

  // Cache for reducing API calls
  const cache = cacheEnabled ? new Map<string, WilayahItem[]>() : null

  const getApiUrl = (level: string, code?: string): string => {
    // Always use server proxy to avoid CORS issues
    if (level === 'provinces') {
      return '/api/wilayah/provinces'
    }
    return `/api/wilayah/${level}/${code}`
  }

  const fetchWilayah = async (level: string, code?: string): Promise<WilayahItem[]> => {
    const url = getApiUrl(level, code)
    
    // Check cache first
    if (cache && cache.has(url)) {
      return cache.get(url)!
    }

    try {
      const response: WilayahResponse = await $fetch(url)
      const result = response.data || []
      
      // Cache the result
      if (cache) {
        cache.set(url, result)
      }
      
      return result
    } catch (error) {
      console.error(`Failed to fetch ${level}${code ? ` for code ${code}` : ''}:`, error)
      return []
    }
  }

  // Rest of the composable remains the same...
  const loadProvinces = async () => {
    loading.value.provinces = true
    try {
      provinces.value = await fetchWilayah('provinces')
    } finally {
      loading.value.provinces = false
    }
  }

  // Watch province changes
  watch(() => selected.value.province, async (provinceCode) => {
    if (provinceCode) {
      loading.value.regencies = true
      try {
        regencies.value = await fetchWilayah('regencies', provinceCode)
      } finally {
        loading.value.regencies = false
      }
    } else {
      regencies.value = []
    }
    
    selected.value.regency = ''
    selected.value.district = ''
    selected.value.village = ''
    districts.value = []
    villages.value = []
  })

  // Watch regency changes
  watch(() => selected.value.regency, async (regencyCode) => {
    if (regencyCode) {
      loading.value.districts = true
      try {
        districts.value = await fetchWilayah('districts', regencyCode)
      } finally {
        loading.value.districts = false
      }
    } else {
      districts.value = []
    }
    
    selected.value.district = ''
    selected.value.village = ''
    villages.value = []
  })

  // Watch district changes
  watch(() => selected.value.district, async (districtCode) => {
    if (districtCode) {
      loading.value.villages = true
      try {
        villages.value = await fetchWilayah('villages', districtCode)
      } finally {
        loading.value.villages = false
      }
    } else {
      villages.value = []
    }
    
    selected.value.village = ''
  })

  // Helper functions
  const getProvinceName = (code: string) => {
    return provinces.value.find(p => p.code === code)?.name || ''
  }

  const getRegencyName = (code: string) => {
    return regencies.value.find(r => r.code === code)?.name || ''
  }

  const getDistrictName = (code: string) => {
    return districts.value.find(d => d.code === code)?.name || ''
  }

  const getVillageName = (code: string) => {
    return villages.value.find(v => v.code === code)?.name || ''
  }

  const getFullAddress = () => {
    const parts = [
      getVillageName(selected.value.village),
      getDistrictName(selected.value.district),
      getRegencyName(selected.value.regency),
      getProvinceName(selected.value.province)
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  const resetSelections = () => {
    selected.value.province = ''
    selected.value.regency = ''
    selected.value.district = ''
    selected.value.village = ''
    regencies.value = []
    districts.value = []
    villages.value = []
  }

  const setSelections = async (selections: {
    province?: string
    regency?: string
    district?: string
    village?: string
  }) => {
    resetSelections()
    
    try {
      if (selections.province) {
        selected.value.province = selections.province
        
        if (selections.regency) {
          await new Promise<void>((resolve) => {
            const unwatch = watch(() => regencies.value.length, (length) => {
              if (length > 0) {
                unwatch()
                resolve()
              }
            }, { immediate: true })
            
            setTimeout(() => {
              unwatch()
              resolve()
            }, 5000)
          })
          
          selected.value.regency = selections.regency
          
          if (selections.district) {
            await new Promise<void>((resolve) => {
              const unwatch = watch(() => districts.value.length, (length) => {
                if (length > 0) {
                  unwatch()
                  resolve()
                }
              }, { immediate: true })
              
              setTimeout(() => {
                unwatch()
                resolve()
              }, 5000)
            })
            
            selected.value.district = selections.district
            
            if (selections.village) {
              await new Promise<void>((resolve) => {
                const unwatch = watch(() => villages.value.length, (length) => {
                  if (length > 0) {
                    unwatch()
                    resolve()
                  }
                }, { immediate: true })
                
                setTimeout(() => {
                  unwatch()
                  resolve()
                }, 5000)
              })
              
              selected.value.village = selections.village
            }
          }
        }
      }
    } catch (error) {
      console.error('Error setting selections:', error)
    }
  }

  const clearCache = () => {
    if (cache) {
      cache.clear()
    }
  }

  const getCacheInfo = () => {
    return {
      size: cache ? cache.size : 0,
      keys: cache ? Array.from(cache.keys()) : []
    }
  }

  return {
    provinces,
    regencies,
    districts,
    villages,
    selected,
    loading,
    loadProvinces,
    getProvinceName,
    getRegencyName,
    getDistrictName,
    getVillageName,
    getFullAddress,
    resetSelections,
    setSelections,
    clearCache,
    getCacheInfo,
  }
}
