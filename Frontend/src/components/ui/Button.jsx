import { motion } from 'motion/react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger:
    'bg-danger text-white hover:bg-danger-strong focus-visible:ring-danger-strong',
  success:
    'bg-success text-white hover:bg-success-strong focus-visible:ring-success-strong',
  outline:
    'border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500',
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-2',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight = false,
  className,
  children,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {Icon && !iconRight && <Icon className="size-4" strokeWidth={2} />}
      {children}
      {Icon && iconRight && <Icon className="size-4" strokeWidth={2} />}
    </motion.button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(Object.keys(variants)),
  size: PropTypes.oneOf(Object.keys(sizes)),
  icon: PropTypes.elementType,
  iconRight: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
}

export function IconButton({ icon: Icon, label, className, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className,
      )}
      {...props}
    >
      <Icon className="size-4" strokeWidth={2} />
    </motion.button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
}