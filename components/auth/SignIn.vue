<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'
import PasswordInput from '~/components/PasswordInput.vue'
import { useAuth } from '~/composables/useAuth'

const email = ref('admin@example.com')
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
        placeholder="admin@example.com"
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
      Login with SSO Sireng
    </Button>
  </div>
</template>

<style scoped>
/* Add additional scoped styling here if needed */
</style>
