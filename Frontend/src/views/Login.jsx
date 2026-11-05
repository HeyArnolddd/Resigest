import { useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { AlertCircle, Eye, EyeOff, Home, Loader2 } from 'lucide-react'
import EscenaConjunto from '../components/login/EscenaConjunto'
import { useSesion } from '../lib/sesion'
import { cn } from '../lib/utils'


// Mensajes del API → texto que explica qué pasó y qué hacer.
function mensajeDeError(e) {
  if (e.status === 0) return e.message
  if (e.status === 400) return 'Escribe un correo válido, por ejemplo nombre@correo.com.'
  if (e.message?.startsWith('Cuenta bloqueada')) {
    return 'Tu cuenta quedó bloqueada por varios intentos fallidos. Espera 15 minutos e intenta de nuevo.'
  }
  if (e.message?.startsWith('Cuenta inactiva')) {
    return 'Tu cuenta está desactivada. Comunícate con la administración del conjunto.'
  }
  if (e.status === 401) return 'El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.'
  return e.message
}

const entrada = (delay) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
})

const campo =
  'h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-brand-300 focus:ring-4 focus:ring-white/30'

export default function Login() {
  const { iniciarSesion, aviso } = useSesion()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [recordar, setRecordar] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const ingresar = async (email, clave) => {
    setError('')
    if (!email.trim() || !clave) {
      setError('Escribe tu correo y tu contraseña.')
      return
    }
    setCargando(true)
    try {
      // Al iniciar sesión, App cambia al portal del rol y este componente se desmonta
      await iniciarSesion(email, clave, recordar)
    } catch (e) {
      setError(mensajeDeError(e))
      setCargando(false)
    }
  }

  const enviar = (e) => {
    e.preventDefault()
    ingresar(correo, contrasena)
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
                  <input
                    type="checkbox"
                    checked={recordar}
                    onChange={(e) => setRecordar(e.target.checked)}
                    className="size-4 rounded accent-brand-900"
                  />
                  Recordarme
                </label>
                <a
                  href="#recuperar"
                  className="rounded-sm font-semibold text-white underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {aviso && !error && (
                <p role="status" className="flex items-start gap-2 rounded-lg bg-white/15 px-3 py-2.5 text-sm font-medium text-white ring-1 ring-white/25">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {aviso}
                </p>
              )}

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
