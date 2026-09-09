export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatCOP(monto) {
  return '$' + monto.toLocaleString('es-CO')
}

export function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function iniciales(nombre) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

const paletaAvatares = [
  'bg-brand-100 text-brand-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export function colorAvatar(nombre) {
  let hash = 0
  for (const c of nombre) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return paletaAvatares[Math.abs(hash) % paletaAvatares.length]
}