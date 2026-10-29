import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { cn } from '../../lib/utils'
import FondoHogar from '../hogar/FondoHogar'

export default function Shell({ role, sections, defaultSection, onExit }) {
  const [active, setActive] = useState(defaultSection)
  const [menuOpen, setMenuOpen] = useState(false)

  const Screen = sections[active] ?? sections[defaultSection]
  // En el residente cada sección es un cuarto de la casa
  const fondoHogar = role.key === 'residente'

  const navegar = (key) => {
    setActive(key)
    setMenuOpen(false)
  }

  // El menú lateral en móvil se cierra con Escape
  useEffect(() => {
    if (!menuOpen) return
    const alPresionar = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [menuOpen])

  return (
    <div className="flex h-full min-h-0">
      <Sidebar role={role} active={active} onSelect={navegar} onExit={onExit} />

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <div className="animate-fade-in absolute inset-y-0 left-0">
            <Sidebar role={role} active={active} onSelect={navegar} onExit={onExit} mobile />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar role={role} onOpenMenu={() => setMenuOpen(true)} onExit={onExit} />
        {/* Todos los roles comparten el fondo verde claro; el residente además tiene muebles */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-brand-100/70 to-brand-50">
          <div className={cn('relative min-h-full p-4 lg:p-6', fondoHogar && 'pb-36 lg:pb-36')}>
            {fondoHogar && <FondoHogar key={`fondo-${active}`} sala={active} className="animate-fade-in absolute inset-0" />}
            <div className="animate-fade-up relative mx-auto max-w-6xl" key={active}>
              <Screen onNavigate={navegar} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}