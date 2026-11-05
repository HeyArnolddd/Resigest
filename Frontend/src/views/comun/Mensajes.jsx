import { motion } from 'motion/react'
import Mensajeria from '../../components/comunidad/Mensajeria'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

// Mensajes privados para portería, mantenimiento y administración (el residente los tiene en Comunidad)
export default function Mensajes() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mensajes</h1>
        <p className="mt-1 text-sm text-slate-500">Conversaciones privadas con residentes y con el resto del equipo</p>
      </div>
      <motion.section {...aparecer(0)} className={cn(tarjeta, 'flex flex-col overflow-hidden lg:h-[calc(100vh-13rem)] lg:min-h-[560px]')}>
        <Mensajeria />
      </motion.section>
    </div>
  )
}
