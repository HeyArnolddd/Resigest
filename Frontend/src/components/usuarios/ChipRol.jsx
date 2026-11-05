import PropTypes from 'prop-types'
import { infoRol } from '../../lib/usuarios'
import { cn } from '../../lib/utils'

export default function ChipRol({ rol }) {
  const r = infoRol(rol)
  const Icono = r.icono
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', r.tinte)}>
      <Icono className="size-3.5" strokeWidth={2} />
      {r.etiqueta}
    </span>
  )
}

ChipRol.propTypes = { rol: PropTypes.string.isRequired }
