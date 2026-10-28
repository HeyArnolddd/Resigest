export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatCOP(monto) {
  return '$' + monto.toLocaleString('es-CO')
}

// Tooltip de una barra: centrado, salvo en las barras de los extremos, donde se pega al borde
// para no salirse de la pantalla.
export function alinearTooltip(indice, total) {
  if (indice === 0) return 'left-0'
  if (indice === total - 1) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}

// En Bucaramanga oscurece hacia las 6 p. m. y amanece hacia las 6 a. m.
export function esDeNoche(fecha = new Date()) {
  const h = fecha.getHours()
  return h >= 18 || h < 6
}

export function saludo(fecha = new Date()) {
  if (esDeNoche(fecha)) return 'Buenas noches'
  return fecha.getHours() < 12 ? 'Buenos días' : 'Buenas tardes'
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
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export function colorAvatar(nombre) {
  let hash = 0
  for (const c of nombre) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return paletaAvatares[Math.abs(hash) % paletaAvatares.length]
}