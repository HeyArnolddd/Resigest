import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Pencil,
  Power,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { Avatar, Button, EmptyState, IconButton, Modal, StatusBadge, Table } from '../../components/ui'
import AccesoUsuario from '../../components/usuarios/AccesoUsuario'
import ChipRol from '../../components/usuarios/ChipRol'
import FormularioUsuario from '../../components/usuarios/FormularioUsuario'
import { useSesion } from '../../lib/sesion'
import { ROLES_USUARIO, detalleRol, infoRol, usuariosApi } from '../../lib/usuarios'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const TAMANO_PAGINA = 10
const ESTADOS = [
  ['', 'Todos'],
  ['true', 'Activos'],
  ['false', 'Inactivos'],
]

function useDebounce(valor, ms = 300) {
  const [diferido, setDiferido] = useState(valor)
  useEffect(() => {
    const t = setTimeout(() => setDiferido(valor), ms)
    return () => clearTimeout(t)
  }, [valor, ms])
  return diferido
}

function TarjetaRol({ info, total, activa, onClick, indice }) {
  const Icono = info.icono
  return (
    <motion.button
      type="button"
      {...aparecer(indice)}
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        tarjeta,
        'flex items-center gap-3 p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
        activa ? 'ring-2 ring-brand-500' : 'hover:-translate-y-0.5',
      )}
    >
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', info.tinte)}>
        <Icono className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-900">{info.plural}</span>
        <span className="block text-xs text-slate-500">{activa ? 'Mostrando solo estos' : 'Ver solo estos'}</span>
      </span>
      <span className="text-2xl font-extrabold tabular-nums text-slate-900">
        {total ?? <span className="inline-block h-6 w-6 animate-pulse rounded bg-slate-100 align-middle" />}
      </span>
    </motion.button>
  )
}

TarjetaRol.propTypes = {
  info: PropTypes.object.isRequired,
  total: PropTypes.number,
  activa: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  indice: PropTypes.number.isRequired,
}

function FilasCargando() {
  return (
    <div className="divide-y divide-slate-100" role="status" aria-label="Cargando usuarios">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <span className="size-9 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-40 animate-pulse rounded bg-slate-100" />
            <span className="block h-2.5 w-56 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
          <span className="hidden h-6 w-24 animate-pulse rounded-full bg-slate-100 sm:block" />
        </div>
      ))}
    </div>
  )
}

// Confirma desactivar o eliminar. Si eliminar no es posible porque la cuenta tiene historial,
// ofrece desactivarla en su lugar.
function Confirmacion({ accion, usuario, onClose, onHecho }) {
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState(null)
  const eliminar = accion === 'eliminar'

  const ejecutar = async (cual) => {
    setTrabajando(true)
    setError(null)
    try {
      if (cual === 'eliminar') await usuariosApi.eliminar(usuario.id)
      else await usuariosApi.desactivar(usuario.id)
      onHecho(cual === 'eliminar' ? `Se eliminó la cuenta de ${usuario.nombreCompleto}.` : `${usuario.nombreCompleto} ya no puede ingresar a ResiGest.`)
    } catch (e) {
      setError(e)
      setTrabajando(false)
    }
  }

  const conHistorial = eliminar && error?.status === 409

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={eliminar ? 'Eliminar usuario' : 'Desactivar usuario'}
      subtitle={usuario.nombreCompleto}
      icon={eliminar ? Trash2 : Power}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {conHistorial && usuario.activo ? (
            <Button variant="danger" icon={Power} disabled={trabajando} onClick={() => ejecutar('desactivar')}>
              Desactivar en su lugar
            </Button>
          ) : (
            <Button variant="danger" disabled={trabajando || conHistorial} onClick={() => ejecutar(accion)}>
              {trabajando ? 'Un momento…' : eliminar ? 'Eliminar cuenta' : 'Desactivar cuenta'}
            </Button>
          )}
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600">
        {eliminar
          ? 'La cuenta se borrará definitivamente. Esta acción no se puede deshacer.'
          : 'No podrá ingresar a ResiGest hasta que la actives de nuevo. Si tiene la sesión abierta, se cerrará. Su historial se conserva.'}
      </p>
      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-strong">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error.message}
        </p>
      )}
    </Modal>
  )
}

Confirmacion.propTypes = {
  accion: PropTypes.oneOf(['eliminar', 'desactivar']).isRequired,
  usuario: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onHecho: PropTypes.func.isRequired,
}

export default function Usuarios() {
  const { usuario: yo } = useSesion()
  const [rol, setRol] = useState('')
  const [activo, setActivo] = useState('')
  const [texto, setTexto] = useState('')
  const busqueda = useDebounce(texto)
  const [pagina, setPagina] = useState(0)
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [conteos, setConteos] = useState({})
  const [version, setVersion] = useState(0)
  const [modal, setModal] = useState(null)
  const [aviso, setAviso] = useState('')

  const recargar = useCallback(() => {
    setError('')
    setVersion((v) => v + 1)
  }, [])

  // Cualquier cambio de filtro vuelve a la primera página
  const filtrarPor = (setter) => (valor) => {
    setter(valor)
    setPagina(0)
  }
  const filtrarRol = filtrarPor(setRol)
  const filtrarActivo = filtrarPor(setActivo)
  const filtrarTexto = filtrarPor(setTexto)

  useEffect(() => {
    let vigente = true
    usuariosApi
      .listar({ rol, activo, q: busqueda, page: pagina, size: TAMANO_PAGINA })
      .then((p) => {
        if (!vigente) return
        setDatos(p)
        setError('')
      })
      .catch((e) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
  }, [rol, activo, busqueda, pagina, version])

  useEffect(() => {
    let vigente = true
    Promise.all(ROLES_USUARIO.map((r) => usuariosApi.contar(r.rol)))
      .then((n) => vigente && setConteos(Object.fromEntries(ROLES_USUARIO.map((r, i) => [r.rol, n[i]]))))
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [version])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  const cerrar = () => setModal(null)
  const terminar = (mensaje) => {
    setModal(null)
    setAviso(mensaje)
    recargar()
  }

  const activar = async (u) => {
    try {
      await usuariosApi.activar(u.id)
      setAviso(`${u.nombreCompleto} puede volver a ingresar a ResiGest.`)
      recargar()
    } catch (e) {
      setAviso('')
      setError(e.message)
    }
  }

  const total = Object.values(conteos).reduce((a, b) => a + b, 0)
  const cargando = !datos && !error
  const hayFiltros = rol || activo || busqueda

  const columnas = [
    {
      key: 'usuario',
      header: 'Usuario',
      render: (u) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nombre={u.nombreCompleto} className={cn(!u.activo && 'opacity-50 grayscale')} />
          <div className="min-w-0">
            <p className={cn('truncate font-semibold', u.activo ? 'text-slate-900' : 'text-slate-500')}>
              {u.nombreCompleto}
              {u.id === yo.id && <span className="ml-1.5 text-xs font-medium text-slate-400">(tú)</span>}
            </p>
            <p className="truncate text-xs font-normal text-slate-500">{u.correo}</p>
          </div>
        </div>
      ),
    },
    { key: 'rol', header: 'Rol', render: (u) => <ChipRol rol={u.rol} /> },
    { key: 'detalle', header: 'Detalle', render: (u) => detalleRol(u) ?? <span className="text-slate-400">—</span> },
    { key: 'documento', header: 'Documento', render: (u) => <span className="tabular-nums">{u.documento}</span> },
    {
      key: 'estado',
      header: 'Estado',
      render: (u) => <StatusBadge status={u.activo ? 'Activo' : 'Inactivo'} tone={u.activo ? 'success' : 'neutral'} />,
    },
    {
      key: 'acciones',
      align: 'right',
      render: (u) => {
        const propio = u.id === yo.id
        return (
          <div className="flex items-center justify-end gap-0.5">
            <IconButton icon={KeyRound} label={`Acceso de ${u.nombreCompleto}`} onClick={() => setModal({ tipo: 'acceso', usuario: u })} />
            <IconButton icon={Pencil} label={`Editar a ${u.nombreCompleto}`} onClick={() => setModal({ tipo: 'editar', usuario: u })} />
            {!propio &&
              (u.activo ? (
                <IconButton icon={Power} label={`Desactivar a ${u.nombreCompleto}`} onClick={() => setModal({ tipo: 'desactivar', usuario: u })} />
              ) : (
                <IconButton icon={RotateCcw} label={`Activar a ${u.nombreCompleto}`} className="text-brand-600" onClick={() => activar(u)} />
              ))}
            {!propio && (
              <IconButton
                icon={Trash2}
                label={`Eliminar a ${u.nombreCompleto}`}
                className="hover:bg-danger-bg hover:text-danger-strong"
                onClick={() => setModal({ tipo: 'eliminar', usuario: u })}
              />
            )}
          </div>
        )
      },
    },
  ]

  const desde = datos ? datos.number * datos.size + 1 : 0
  const hasta = datos ? desde + datos.content.length - 1 : 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total ? `${total} cuentas · ` : ''}Crea y administra el acceso de residentes, portería y mantenimiento
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setModal({ tipo: 'crear' })}>
          Crear usuario
        </Button>
      </div>

      <AnimatePresence>
        {aviso && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-strong ring-1 ring-green-200"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="font-medium">{aviso}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ROLES_USUARIO.map((r, i) => (
          <TarjetaRol
            key={r.rol}
            info={r}
            indice={i}
            total={conteos[r.rol]}
            activa={rol === r.rol}
            onClick={() => filtrarRol(rol === r.rol ? '' : r.rol)}
          />
        ))}
      </div>

      <motion.section {...aparecer(4)} className={cn(tarjeta, 'overflow-hidden')}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-3">
          <label className="relative w-full sm:w-80">
            <span className="sr-only">Buscar por nombre, correo o documento</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={texto}
              onChange={(e) => filtrarTexto(e.target.value)}
              placeholder="Buscar nombre, correo o cédula…"
              className="w-full rounded-full bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </label>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Estado de la cuenta">
            {ESTADOS.map(([valor, etiqueta]) => (
              <button
                key={etiqueta}
                type="button"
                role="radio"
                aria-checked={activo === valor}
                onClick={() => filtrarActivo(valor)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                  activo === valor ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                )}
              >
                {etiqueta}
              </button>
            ))}
          </div>
          {rol && (
            <p className="text-xs text-slate-500 sm:ml-auto">
              Filtrando: <span className="font-semibold text-slate-700">{infoRol(rol).plural}</span>
            </p>
          )}
        </div>

        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="No se pudo cargar la lista de usuarios"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        ) : cargando ? (
          <FilasCargando />
        ) : datos.content.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={hayFiltros ? 'Ningún usuario coincide' : 'Todavía no hay usuarios'}
            description={hayFiltros ? 'Prueba con otra búsqueda o quita los filtros.' : 'Crea la primera cuenta para que pueda ingresar a ResiGest.'}
            action={
              hayFiltros ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    filtrarRol('')
                    filtrarActivo('')
                    filtrarTexto('')
                  }}
                >
                  Quitar filtros
                </Button>
              ) : (
                <Button size="sm" icon={UserPlus} className="mt-2" onClick={() => setModal({ tipo: 'crear' })}>
                  Crear usuario
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table columns={columnas} data={datos.content} />
            {datos.totalPages > 1 && (
              <nav aria-label="Paginación" className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
                <p className="text-xs text-slate-500">
                  {desde}–{hasta} de <span className="font-semibold text-slate-700">{datos.totalElements}</span>
                </p>
                <div className="flex items-center gap-1">
                  <IconButton icon={ChevronLeft} label="Página anterior" disabled={datos.first} onClick={() => setPagina(pagina - 1)} className="disabled:opacity-40" />
                  <span className="px-2 text-xs font-semibold tabular-nums text-slate-700">
                    {datos.number + 1} / {datos.totalPages}
                  </span>
                  <IconButton icon={ChevronRight} label="Página siguiente" disabled={datos.last} onClick={() => setPagina(pagina + 1)} className="disabled:opacity-40" />
                </div>
              </nav>
            )}
          </>
        )}
      </motion.section>

      {modal?.tipo === 'crear' && (
        <FormularioUsuario
          rolInicial={rol || 'RESIDENTE'}
          onClose={cerrar}
          onGuardado={recargar}
        />
      )}
      {modal?.tipo === 'editar' && (
        <FormularioUsuario
          usuario={modal.usuario}
          onClose={cerrar}
          onGuardado={(u) => {
            setAviso(`Se guardaron los cambios de ${u.nombreCompleto}.`)
            recargar()
          }}
        />
      )}
      {modal?.tipo === 'acceso' && <AccesoUsuario usuario={modal.usuario} onClose={cerrar} />}
      {(modal?.tipo === 'desactivar' || modal?.tipo === 'eliminar') && (
        <Confirmacion accion={modal.tipo} usuario={modal.usuario} onClose={cerrar} onHecho={terminar} />
      )}
    </div>
  )
}
