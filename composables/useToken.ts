// composables/useToken.ts
export function useToken() {
  return useCookie('token') // atau useState('token', () => '')
}
