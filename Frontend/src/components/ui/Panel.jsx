import PropTypes from 'prop-types'
import { ArrowRight } from 'lucide-react'

// Piezas del estilo "panel" de las vistas del residente: título con cuadrito de marca y
// enlace "ver más". La clase de tarjeta y la animación de entrada están en lib/panel.js.

export function Titulo({ children, accion }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="size-2.5 rounded-[3px] bg-brand-500" />
        {children}
      </h2>
      {accion}
    </div>
  )
}

Titulo.propTypes = { children: PropTypes.node, accion: PropTypes.node }

export function VerMas({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1 rounded-md text-xs font-semibold text-brand-700 outline-none hover:text-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

VerMas.propTypes = { children: PropTypes.node, onClick: PropTypes.func }
