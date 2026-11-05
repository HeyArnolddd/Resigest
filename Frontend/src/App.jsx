import Login from './views/Login'
import Shell from './components/layout/Shell'
import { roles } from './config/roles'
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
  const { sesion, iniciando, cerrar } = useSesion()

  if (iniciando) return null
  if (!sesion) return <Login />

  // Datos de la persona autenticada sobre la definición estática del rol.
  const role = {
    ...roles[sesion.roleKey],
    usuario: sesion.usuario,
    detalle: sesion.detalle ?? roles[sesion.roleKey].detalle,
  }
  const defaultSection = sesion.roleKey === 'administrador' ? 'dashboard' : 'inicio'

  return (
    <Shell
      key={sesion.roleKey}
      role={role}
      sections={mapSections[sesion.roleKey]}
      defaultSection={defaultSection}
      onExit={cerrar}
    />
  )
}

export default App
