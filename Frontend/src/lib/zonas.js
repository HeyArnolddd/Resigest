// Color fijo por zona común, asignado por id. Se evita el verde (marca) y el rojo (error).
// Las clases van escritas completas para que Tailwind las detecte.
const paleta = [
  { solido: 'bg-sky-700 text-white', suave: 'bg-sky-50 text-sky-900 border-sky-500', punto: 'bg-sky-700', anillo: 'ring-sky-500', texto: 'text-sky-700' },
  { solido: 'bg-violet-600 text-white', suave: 'bg-violet-50 text-violet-900 border-violet-500', punto: 'bg-violet-600', anillo: 'ring-violet-500', texto: 'text-violet-700' },
  { solido: 'bg-orange-700 text-white', suave: 'bg-orange-50 text-orange-900 border-orange-500', punto: 'bg-orange-700', anillo: 'ring-orange-500', texto: 'text-orange-700' },
  { solido: 'bg-yellow-400 text-yellow-950', suave: 'bg-yellow-50 text-yellow-900 border-yellow-500', punto: 'bg-yellow-400', anillo: 'ring-yellow-500', texto: 'text-yellow-800' },
  { solido: 'bg-pink-700 text-white', suave: 'bg-pink-50 text-pink-900 border-pink-500', punto: 'bg-pink-700', anillo: 'ring-pink-500', texto: 'text-pink-700' },
  { solido: 'bg-cyan-800 text-white', suave: 'bg-cyan-50 text-cyan-900 border-cyan-600', punto: 'bg-cyan-800', anillo: 'ring-cyan-600', texto: 'text-cyan-800' },
  { solido: 'bg-slate-600 text-white', suave: 'bg-slate-50 text-slate-900 border-slate-500', punto: 'bg-slate-600', anillo: 'ring-slate-500', texto: 'text-slate-700' },
]

export function colorZona(zonaId) {
  return paleta[(Math.max(1, zonaId) - 1) % paleta.length]
}
