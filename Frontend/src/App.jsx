import { Loader2 } from 'lucide-react'
import Login from './views/Login'
import Shell from './components/layout/Shell'
import { detalleUsuario, rolDesdeApi, roles } from './config/roles'
import { useSesion } from './lib/sesion'
import { sections as sectionsResidente } from './views/residente/sections'
import { sections as sectionsPorteria } from './views/porteria/sections'
import { sections as sectionsMantenimiento } from './views/mantenimiento/sections'
import { sections as sectionsAdministrador } from './views/administrador/sections'

const mapSections = {
  residente: sectionsResidente,
  porteria: sectionsPorteria,
  mantenimiento: sectionsMantenimiento,
  administrador: sectionsAdministrador,
}

function App() {
  const { usuario, restaurando, cerrarSesion } = useSesion()

  if (restaurando) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-600 text-white" role="status">
        <Loader2 className="size-6 animate-spin" />
        <span className="sr-only">Cargando tu sesión…</span>
      </div>
    )
  }

  if (!usuario) {
    return <Login />
  }

  const roleKey = rolDesdeApi[usuario.rol]
  // El menú y la barra superior muestran al usuario que inició sesión
  const role = { ...roles[roleKey], usuario: usuario.nombreCompleto, detalle: detalleUsuario(usuario) }
  // Al volver de pagar en PayU (?referenceCode=...) el residente aterriza en Finanzas
  const vuelveDePago = roleKey === 'residente' && new URLSearchParams(window.location.search).has('referenceCode')
  const defaultSection = roleKey === 'administrador' ? 'dashboard' : vuelveDePago ? 'finanzas' : 'inicio'

  return (
    <Shell
      key={usuario.id}
      role={role}
      sections={mapSections[roleKey]}
      defaultSection={defaultSection}
      onExit={() => cerrarSesion()}
    />
  )
}

export default App
