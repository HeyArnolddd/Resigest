import PropTypes from 'prop-types'
import { cn, colorAvatar, iniciales } from '../../lib/utils'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export default function Avatar({ nombre, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        sizes[size],
        colorAvatar(nombre),
        className,
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}

Avatar.propTypes = {
  nombre: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.keys(sizes)),
  className: PropTypes.string,
}