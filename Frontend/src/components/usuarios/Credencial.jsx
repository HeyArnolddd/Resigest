import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Check, Copy, Eye, EyeOff, KeyRound, UserRound } from 'lucide-react'
import { cn } from '../../lib/utils'

function Copiar({ texto, etiqueta }) {
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 1800)
    return () => clearTimeout(t)
  }, [copiado])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
    } catch {
      // Sin permiso de portapapeles: el texto sigue visible para copiarlo a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={copiado ? `${etiqueta} copiado` : `Copiar ${etiqueta}`}
      title={copiado ? 'Copiado' : `Copiar ${etiqueta}`}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
        copiado ? 'bg-success-bg text-success-strong' : 'text-slate-400 hover:bg-white hover:text-slate-700',
      )}
    >
      {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  )
}

Copiar.propTypes = { texto: PropTypes.string.isRequired, etiqueta: PropTypes.string.isRequired }

function Fila({ icono: Icono, etiqueta, children, acciones }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icono className="size-4 shrink-0 text-brand-600" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500">{etiqueta}</p>
        <div className="truncate font-mono text-sm font-semibold text-slate-900">{children}</div>
      </div>
      {acciones}
    </div>
  )
}

Fila.propTypes = {
  icono: PropTypes.elementType.isRequired,
  etiqueta: PropTypes.string.isRequired,
  children: PropTypes.node,
  acciones: PropTypes.node,
}

// Usuario y contraseña con botones para copiar. La contraseña empieza oculta salvo que se pida lo contrario.
export default function Credencial({ correo, contrasena, mostrarContrasena = false }) {
  const [visible, setVisible] = useState(mostrarContrasena)

  return (
    <div className="divide-y divide-brand-100 rounded-xl bg-brand-50/60 ring-1 ring-brand-100">
      <Fila icono={UserRound} etiqueta="Usuario (correo)" acciones={<Copiar texto={correo} etiqueta="usuario" />}>
        {correo}
      </Fila>
      {contrasena && (
        <Fila
          icono={KeyRound}
          etiqueta="Contraseña"
          acciones={
            <div className="flex">
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={visible ? 'Ocultar' : 'Mostrar'}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <Copiar texto={contrasena} etiqueta="contraseña" />
            </div>
          }
        >
          {visible ? contrasena : '•'.repeat(10)}
        </Fila>
      )}
    </div>
  )
}

Credencial.propTypes = {
  correo: PropTypes.string.isRequired,
  contrasena: PropTypes.string,
  mostrarContrasena: PropTypes.bool,
}
