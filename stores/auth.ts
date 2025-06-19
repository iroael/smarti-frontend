// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as any,
  }),

  actions: {
    setAuth(token: string) {
      this.token = token
    },

    async fetchProfile() {
      if (!this.token) return

      try {
        const data = await $fetch('/auth/profile', {
          baseURL: useRuntimeConfig().public.apiBase,
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.user = data
      } catch (err) {
        console.error('[auth] Failed to fetch profile:', err)
      }
    },

    logout() {
      this.token = null
      this.user = null
    },
  },

  persist: true, // Persist state across sessions
})
