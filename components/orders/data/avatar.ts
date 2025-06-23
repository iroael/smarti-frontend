// utils/avatar.ts
export function generateAvatar(name: string = '', avatarUrl?: string) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const colors = [
    'hsl(0, 70%, 50%)', 'hsl(210, 70%, 50%)', 'hsl(120, 70%, 45%)',
    'hsl(45, 70%, 50%)', 'hsl(270, 70%, 50%)', 'hsl(330, 70%, 50%)'
  ]

  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const color = colors[hash % colors.length]

  return {
    initials,
    color,
    avatarUrl,
  }
}
