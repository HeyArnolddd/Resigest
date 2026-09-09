import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

const tones = {
  success: 'text-success-strong',
  warning: 'text-warning-strong',
  danger: 'text-danger-strong',
  info: 'text-brand-700',
  neutral: 'text-slate-600',
}

function toneFor(status) {
  const s = status.toLowerCase()
  if (['pagada', 'aprobada', 'entregado', 'completado', 'resuelta', 'correcto'].includes(s)) return 'success'
  if (['pendiente', 'pendiente revisión', 'en proceso', 'ha llegado', 'en portería'].includes(s)) return 'warning'
  if (['rechazada', 'reabierta', 'incorrecto', 'rechazado'].includes(s)) return 'danger'
  if (['nueva', 'no ha llegado', 'programada', 'publicado', 'evaluada'].includes(s)) return 'info'
  return 'neutral'
}

export default function StatusBadge({ status, tone, dot = true, className }) {
  const t = tone || toneFor(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium',
        tones[t],
        className,
      )}
    >
      {dot && <span className={cn('h-2 w-2 rounded-full bg-current')} />}
      {status}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(Object.keys(tones)),
  dot: PropTypes.bool,
  className: PropTypes.string,
}