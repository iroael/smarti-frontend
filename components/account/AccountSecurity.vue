
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import { Eye, EyeOff, User } from 'lucide-vue-next'

const accountData = ref({
  username: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

function updateAccount() {
  if (
    accountData.value.newPassword &&
    accountData.value.newPassword !== accountData.value.confirmPassword
  ) {
    alert('Password baru dan konfirmasi tidak cocok!')
    return
  }

  // Simulasi pengiriman data (ganti dengan request ke backend)
  console.log('Data akun diupdate:', accountData.value)

  alert('Data akun berhasil diperbarui!')
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Keamanan Akun</CardTitle>
      <CardDescription>
        Kelola username dan password akun Anda
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-6">
      <div class="max-w-md space-y-6">
        <!-- Username -->
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <div class="relative">
            <Input
              id="username"
              v-model="accountData.username"
              placeholder="username"
              class="h-12 pr-10"
            />
            <User class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <!-- Password Section -->
        <Card class="bg-muted/50">
          <CardHeader class="pb-4">
            <CardTitle class="text-base">Ubah Password</CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <!-- Current Password -->
            <div class="space-y-2">
              <Label for="current-pwd">Password Saat Ini</Label>
              <div class="relative">
                <Input
                  id="current-pwd"
                  v-model="accountData.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Masukkan password saat ini"
                  class="h-12 pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Eye v-if="showCurrentPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <!-- New Password -->
            <div class="space-y-2">
              <Label for="new-pwd">Password Baru</Label>
              <div class="relative">
                <Input
                  id="new-pwd"
                  v-model="accountData.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Masukkan password baru"
                  class="h-12 pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Eye v-if="showNewPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <Label for="confirm-pwd">Konfirmasi Password Baru</Label>
              <div class="relative">
                <Input
                  id="confirm-pwd"
                  v-model="accountData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Konfirmasi password baru"
                  class="h-12 pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Eye v-if="showConfirmPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>

    <CardFooter class="justify-end">
      <Button
        class="bg-green-600 hover:bg-green-700"
        @click="updateAccount"
      >
        Update Akun
      </Button>
    </CardFooter>
  </Card>
</template>

