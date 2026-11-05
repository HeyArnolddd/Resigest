import { Bike, Package, UserRound, Wrench } from 'lucide-react'

// Color e icono por tipo de movimiento en portería (se repiten en Inicio, Visitantes y Bitácora)
export const tipoMovimiento = {
  Visitante: { icono: UserRound, chip: 'bg-brand-50 text-brand-700', icon: 'bg-brand-50 text-brand-700 ring-brand-100', punto: 'bg-brand-500', banda: 'bg-brand-600 text-white' },
  Domicilio: { icono: Bike, chip: 'bg-amber-50 text-amber-700', icon: 'bg-amber-50 text-amber-600 ring-amber-100', punto: 'bg-amber-500', banda: 'bg-amber-300 text-amber-950' },
  Servicio: { icono: Wrench, chip: 'bg-sky-50 text-sky-700', icon: 'bg-sky-50 text-sky-600 ring-sky-100', punto: 'bg-sky-500', banda: 'bg-sky-600 text-white' },
  Paquete: { icono: Package, chip: 'bg-violet-50 text-violet-700', icon: 'bg-violet-50 text-violet-600 ring-violet-100', punto: 'bg-violet-500', banda: 'bg-violet-600 text-white' },
}

export const estiloTipo = (tipo) => tipoMovimiento[tipo] ?? tipoMovimiento.Visitante

export const horaActual = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
