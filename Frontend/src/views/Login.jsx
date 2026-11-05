import { useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { AlertCircle, Eye, EyeOff, Home, Loader2 } from 'lucide-react'
import PropTypes from 'prop-types'
import EscenaConjunto from '../components/login/EscenaConjunto'
import { cn } from '../lib/utils'

// Usuarios demo del backend (V12__datos_demo.sql), todos con contraseña admin123.
// Al conectar el API esto se reemplaza por POST /api/auth/login → { token, rol }.
const DEMO = [
  { correo: 'residente@resigest.com', rol: 'residente', etiqueta: 'Residente' },
  { correo: 'portero@resigest.com', rol: 'porteria', etiqueta: 'Portería' },
  { correo: 'tecnico@resigest.com', rol: 'mantenimiento', etiqueta: 'Mantenimiento' },
  { correo: 'admin@resigest.com', rol: 'administrador', etiqueta: 'Administrador' },
]
const CONTRASENA_DEMO = 'admin123'

const entrada = (delay) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
})

const campo =
  'h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-brand-300 focus:ring-4 focus:ring-white/30'

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const ingresar = (email, clave) => {
    setError('')
    if (!email.trim() || !clave) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setCargando(true)
    // Simula la latencia del API
    setTimeout(() => {
      const usuario = DEMO.find((u) => u.correo === email.trim().toLowerCase())
      if (!usuario || clave !== CONTRASENA_DEMO) {
        setCargando(false)
        setError('El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.')
        return
      }
      onLogin(usuario.rol)
    }, 700)
  }

  const enviar = (e) => {
    e.preventDefault()
    ingresar(correo, contrasena)
  }

  const accesoRapido = (u) => {
    setCorreo(u.correo)
    setContrasena(CONTRASENA_DEMO)
    ingresar(u.correo, CONTRASENA_DEMO)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-brand-600 via-brand-600 to-brand-700 text-white">
        <EscenaConjunto className="absolute inset-0 hidden h-full w-full sm:block" />
        <EscenaConjunto ajuste="completa" className="absolute inset-x-0 bottom-0 h-full w-full sm:hidden" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
          <motion.div {...entrada(0)} className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-lg bg-white text-brand-600 shadow-lg shadow-brand-900/20">
              <Home className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">ResiGest</span>
          </motion.div>
          <motion.a
            {...entrada(0.05)}
            href="mailto:soporte@resigest.com"
            className="rounded-md text-sm font-medium text-brand-50 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white"
          >
            ¿Necesitas ayuda?
          </motion.a>
        </header>

        <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-64 pt-6 sm:items-center sm:pb-20 sm:pt-0">
          <div className="w-full max-w-sm">
            <motion.h1
              {...entrada(0.1)}
              className="text-center text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl"
            >
              Tu conjunto,
              <br />
              en un solo lugar
            </motion.h1>
            <motion.p {...entrada(0.18)} className="mx-auto mt-4 max-w-xs text-center text-base text-brand-50">
              Paga tu administración, reserva zonas comunes y entérate de todo lo que pasa en casa.
            </motion.p>

            <motion.form {...entrada(0.26)} onSubmit={enviar} noValidate className="mt-8 space-y-3">
              <div>
                <label htmlFor="correo" className="mb-1.5 block text-sm font-semibold text-white">
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  aria-invalid={Boolean(error)}
                  className={campo}
                />
              </div>

              <div>
                <label htmlFor="contrasena" className="mb-1.5 block text-sm font-semibold text-white">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="contrasena"
                    type={verContrasena ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    aria-invalid={Boolean(error)}
                    className={cn(campo, 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setVerContrasena(!verContrasena)}
                    aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-400 outline-none hover:text-slate-600 focus-visible:text-brand-600"
                  >
                    {verContrasena ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-brand-50">
                  <input type="checkbox" className="size-4 rounded accent-brand-900" />
                  Recordarme
                </label>
                <a
                  href="#recuperar"
                  className="rounded-sm font-semibold text-white underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-danger-strong"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={cargando}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-950 text-base font-bold text-white shadow-lg shadow-brand-950/30 outline-none transition-colors hover:bg-black focus-visible:ring-4 focus-visible:ring-white/40 disabled:opacity-80"
              >
                {cargando && <Loader2 className="size-4 animate-spin" />}
                {cargando ? 'Ingresando…' : 'Ingresar'}
              </motion.button>
            </motion.form>

            <motion.div {...entrada(0.34)} className="mt-6 text-center">
              <p className="text-xs font-medium text-brand-100">Acceso rápido para la demo</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {DEMO.map((u) => (
                  <button
                    key={u.rol}
                    type="button"
                    disabled={cargando}
                    onClick={() => accesoRapido(u)}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white outline-none backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {u.etiqueta}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </main>

        <footer className="relative z-10 mx-auto hidden w-full sm:flex max-w-6xl flex-wrap justify-between gap-2 px-4 pb-5 text-xs text-brand-50 sm:px-8">
          <span>Conjunto Residencial Los Robles · Bucaramanga</span>
          <span>© 2026 ResiGest</span>
        </footer>
      </div>
    </MotionConfig>
  )
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
}
