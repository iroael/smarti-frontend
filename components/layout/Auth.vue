<script setup lang="ts">
defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div
    class="relative flex h-dvh items-center justify-center px-4 lg:px-0"
    :class="{ 'flex-row-reverse': reverse }"
  >
    <!-- Sidebar (Hidden on small screens) -->
    <div
      class="relative hidden h-full w-1/2 flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden"
    >
      <!-- Background Image -->
      <img
        src="/back_logo.jpg"
        alt="Background"
        class="absolute inset-0 h-full w-full object-cover z-0"
      />

      <!-- Overlay Gradient -->
      <div class="absolute inset-0 z-10 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />

      <!-- Logo & Branding -->
      <div class="relative z-20 flex items-center text-2xl font-bold tracking-wide">
        SMARTI<span class="text-primary">.ID</span>
      </div>

      <!-- Quote -->
      <div class="relative z-20 mt-auto text-white">
        <blockquote class="space-y-3">
          <p class="text-xl font-semibold leading-snug">
            “This library has saved me countless hours of work and helped me deliver stunning designs faster.”
          </p>
          <footer class="text-sm text-white/70">— Sofia Davis</footer>
        </blockquote>
      </div>
    </div>

    <!-- Main Content (Form) -->
    <div class="mx-auto w-full max-w-md lg:max-w-lg px-4 py-8">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Optional custom styles if needed */
</style>
