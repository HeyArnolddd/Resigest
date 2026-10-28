// Estilo "panel" de las vistas del residente: tarjeta blanca con sombra suave y entrada escalonada.

export const tarjeta = 'rounded-2xl bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04),0_12px_32px_-16px_rgb(15_23_42/0.18)]'

export const aparecer = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
})
