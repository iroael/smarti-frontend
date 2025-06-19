// middleware/auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // Biarkan halaman login dan publik tetap bisa diakses
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/signin']
  if (publicPages.includes(to.path)) 
    return

  // Jika tidak ada token, redirect ke /signin
  if (!auth.token) {
    return navigateTo('/login')
  }

  // Optional: Cek user profile jika belum di-load
  if (!auth.user) {
    await auth.fetchProfile()

    // Jika profile gagal diambil (misal token expired), logout dan redirect
    if (!auth.user) {
      auth.logout()
      return navigateTo('/login')
    }
  }
})
