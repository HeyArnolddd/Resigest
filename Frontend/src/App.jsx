import { useState } from 'react'
import RoleSelector from './views/RoleSelector'
import Shell from './components/layout/Shell'
import { roles } from './config/roles'
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
  const [roleKey, setRoleKey] = useState(null)

  const onExit = () => setRoleKey(null)

  if (!roleKey) {
    return <RoleSelector onSelect={setRoleKey} />
  }

  const role = roles[roleKey]
  const defaultSection = roleKey === 'administrador' ? 'dashboard' : 'inicio'

  return (
    <Shell
      role={role}
      sections={mapSections[roleKey]}
      defaultSection={defaultSection}
      onExit={onExit}
    />
  )
}

export default App