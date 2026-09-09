import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Shell({ role, sections, defaultSection, onExit }) {
  const [active, setActive] = useState(defaultSection)
  const [menuOpen, setMenuOpen] = useState(false)

  const Screen = sections[active] ?? sections[defaultSection]

  const navegar = (key) => {
    setActive(key)
    setMenuOpen(false)
  }

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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-up mx-auto max-w-6xl" key={active}>
            <Screen onNavigate={navegar} />
          </div>
        </main>
      </div>
    </div>
  )
}