export function formatAge(age: number): string {
  const minutes = age

  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60

  // >= 1 dia → dias + horas
  if (days > 0) {
    return `${days} d ${hours} hrs`
  }

  // >= 1 hora → horas + minutos
  if (hours > 0) {
    return `${hours} h ${mins} min`
  }

  // < 1 hora → apenas minutos
  return `${mins} min`
}
