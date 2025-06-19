<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'
import PasswordInput from '~/components/PasswordInput.vue'
import { useAuth } from '~/composables/useAuth'

const email = ref('john@example.com')
const password = ref('securePassword123')
const isLoading = ref(false)
const errorMessage = ref('')

const { login } = useAuth()

async function onSubmit(event: Event) {
  event.preventDefault()
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in both email and password.'
    return
  }

  isLoading.value = true

  const success = await login(email.value, password.value)

  if (success) {
    navigateTo('/') // redirect to homepage
  } else {
    errorMessage.value = 'Login failed. Please check your credentials.'
  }

  isLoading.value = false
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div class="grid gap-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="john@example.com"
        :disabled="isLoading"
        autocomplete="email"
      />
    </div>

    <div class="grid gap-2">
      <div class="flex items-center">
        <Label for="password">Password</Label>
        <NuxtLink to="/forgot-password" class="ml-auto text-sm underline">
          Forgot your password?
        </NuxtLink>
      </div>
      <PasswordInput id="password" v-model="password" :disabled="isLoading" />
    </div>

    <Button type="submit" class="w-full" :disabled="isLoading">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      Login
    </Button>

    <p v-if="errorMessage" class="text-sm text-red-500 text-center">
      {{ errorMessage }}
    </p>
  </form>

  <Separator label="Or continue with" />

  <div class="flex flex-col gap-4">
    <Button variant="outline" class="w-full gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-4">
        <path
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
          fill="currentColor"
        />
      </svg>
      Login with SSO Sireng
    </Button>
  </div>
</template>

<style scoped>
/* Add additional scoped styling here if needed */
</style>
