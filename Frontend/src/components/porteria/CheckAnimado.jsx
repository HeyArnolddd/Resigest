import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

// Confirmación de registro: el círculo y el check se dibujan solos.
export default function CheckAnimado({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-16', className)} aria-hidden="true">
      <circle cx="32" cy="32" r="30" className="fill-success-bg" />
      <motion.circle
        cx="32"
        cy="32"
        r="26"
        strokeWidth="3"
        className="fill-none stroke-success"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <motion.path
        d="M21 33 l8 8 l15 -16"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-none stroke-success"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  )
}

CheckAnimado.propTypes = { className: PropTypes.string }
