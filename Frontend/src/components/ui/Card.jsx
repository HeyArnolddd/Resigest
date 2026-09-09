import PropTypes from 'prop-types'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
}

const statTints = {
  primary: 'bg-brand-50 text-brand-700',
  success: 'bg-success-bg text-success-strong',
  warning: 'bg-warning-bg text-warning-strong',
  danger: 'bg-danger-bg text-danger-strong',
  violet: 'bg-violet-50 text-violet-600',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'primary',
  onClick,
  footer,
}) {
  const isButton = typeof onClick === 'function'
  const Comp = isButton ? motion.button : 'div'
  return (
    <Comp
      {...(isButton
        ? { whileTap: { scale: 0.98 }, onClick, type: 'button', className: 'tactile text-left' }
        : {})}
      className={cn(
        'group w-full rounded-lg border border-slate-200 bg-white p-5',
        !isButton && 'block',
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', statTints[tone])}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        {isButton && (
          <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-600" />
        )}
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      {footer}
    </Comp>
  )
}

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  sub: PropTypes.node,
  tone: PropTypes.oneOf(Object.keys(statTints)),
  onClick: PropTypes.func,
  footer: PropTypes.node,
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
}