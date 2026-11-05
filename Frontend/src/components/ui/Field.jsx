import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

const base =
  'w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50 disabled:text-slate-400'

export function Field({ label, hint, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

Field.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.node,
  required: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export function Input({ className, ...props }) {
  return <input className={cn(base, 'h-10', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(base, 'h-10 appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(base, 'min-h-24 py-3', className)} {...props} />
}

Textarea.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
}

export function UploadBox({ hint = 'Arrastra el archivo o haz clic para seleccionar' }) {
  return (
    <button
      type="button"
      className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
    >
      <span className="text-xs font-medium text-slate-500">{hint}</span>
      <span className="text-xs text-slate-400">JPG, PNG o PDF · Máx. 5 MB</span>
    </button>
  )
}

UploadBox.propTypes = {
  hint: PropTypes.string,
}