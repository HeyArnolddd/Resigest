import { useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { Input } from '../ui'
import { generarContrasena } from '../../lib/usuarios'

// Contraseña que asigna el administrador: se puede ver mientras se escribe y generar una al azar.
export default function CampoContrasena({ id, value, onChange, invalido, autoFocus }) {
  const [visible, setVisible] = useState(false)

  const generar = () => {
    onChange(generarContrasena())
    setVisible(true)
  }

  return (
    <div className="flex gap-2">
      <div className="relative min-w-0 flex-1">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          aria-invalid={invalido}
          autoFocus={autoFocus}
          className="pr-10 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-400 outline-none hover:text-slate-600 focus-visible:text-brand-600"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <button
        type="button"
        onClick={generar}
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 outline-none transition-colors hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Sparkles className="size-4" strokeWidth={2} />
        Generar
      </button>
    </div>
  )
}

CampoContrasena.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  invalido: PropTypes.bool,
  autoFocus: PropTypes.bool,
}
