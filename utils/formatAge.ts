export function formatAge(age: number): string {
  const minutes = age
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60

  const parts = []
  if (days > 0) parts.push(`${days} d`)
  if (hours > 0) parts.push(`${hours} h`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins} m`)

  return parts.join(' ')
}