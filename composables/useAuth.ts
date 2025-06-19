// composables/useAuth.ts
import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await $fetch('/auth/login', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.apiBase,
        body: { email, password },
      })

      authStore.setAuth(access_token)
      await authStore.fetchProfile()

      return true
    } catch (err) {
      console.error('[auth] Login failed:', err)
      return false
    }
  }

  const logout = () => {
    authStore.logout()
    navigateTo('/signin')
  }

  return {
    login,
    logout,
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => !!authStore.token),
  }
}
