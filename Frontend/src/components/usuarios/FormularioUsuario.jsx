import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, CheckCircle2, Info, Pencil, UserPlus } from 'lucide-react'
import { Button, Field, Input, Modal, Select } from '../ui'
import CampoContrasena from './CampoContrasena'
import ChipRol from './ChipRol'
import Credencial from './Credencial'
import { tipoResidente, turnosPorteria } from '../../lib/labels'
import { ESPECIALIDADES, ROLES_USUARIO, esPersonal, infoRol, usuariosApi } from '../../lib/usuarios'
import { cn } from '../../lib/utils'

const ID_FORM = 'formulario-usuario'
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const vacio = {
  nombreCompleto: '',
  documento: '',
  telefono: '',
  correo: '',
  contrasena: '',
  tipoResidente: 'PROPIETARIO',
  apartamentoId: '',
  turno: '',
  especialidad: '',
}

function desdeUsuario(u) {
  return {
    ...vacio,
    nombreCompleto: u.nombreCompleto,
    documento: u.documento,
    telefono: u.telefono ?? '',
    correo: u.correo,
    tipoResidente: u.tipoResidente ?? 'PROPIETARIO',
    apartamentoId: u.apartamentoId ? String(u.apartamentoId) : '',
    turno: u.turno ?? '',
    especialidad: u.especialidad ?? '',
  }
}

function validar(datos, rol, creando) {
  const e = {}
  if (!datos.nombreCompleto.trim()) e.nombreCompleto = 'Escribe el nombre completo.'
  if (!datos.documento.trim()) e.documento = 'Escribe el número de documento.'
  if (!CORREO_VALIDO.test(datos.correo.trim())) e.correo = 'Escribe un correo válido, por ejemplo nombre@correo.com.'
  if (creando && datos.contrasena.length < 6) e.contrasena = 'La contraseña debe tener al menos 6 caracteres.'
  if (rol === 'RESIDENTE' && !datos.apartamentoId) e.apartamentoId = 'Elige el apartamento del residente.'
  return e
}

// Solo se envían los campos del rol; los demás van vacíos para no mezclar datos de otro rol.
function cuerpo(datos, rol, creando) {
  const texto = (v) => v.trim() || null
  return {
    nombreCompleto: datos.nombreCompleto.trim(),
    documento: datos.documento.trim(),
    telefono: texto(datos.telefono),
    correo: datos.correo.trim(),
    ...(creando && { rol, contrasena: datos.contrasena }),
    tipoResidente: rol === 'RESIDENTE' ? datos.tipoResidente : null,
    apartamentoId: rol === 'RESIDENTE' ? Number(datos.apartamentoId) : null,
    turno: rol === 'PORTERO' ? texto(datos.turno) : null,
    especialidad: rol === 'MANTENIMIENTO' ? texto(datos.especialidad) : null,
  }
}

function SelectorRol({ rol, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Rol del usuario">
      {ROLES_USUARIO.map((r) => {
        const Icono = r.icono
        const activo = rol === r.rol
        return (
          <button
            key={r.rol}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(r.rol)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
              activo ? cn(r.tinte, r.anillo, 'ring-2') : 'text-slate-600 ring-slate-200 hover:bg-slate-50',
            )}
          >
            <Icono className="size-5" strokeWidth={2} />
            {r.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

SelectorRol.propTypes = { rol: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired }

function Apartamentos({ value, onChange, error }) {
  const [lista, setLista] = useState(null)
  const [fallo, setFallo] = useState('')

  useEffect(() => {
    let vigente = true
    usuariosApi
      .apartamentos()
      .then((a) => vigente && setLista(a))
      .catch((e) => vigente && setFallo(e.message))
    return () => {
      vigente = false
    }
  }, [])

  // Agrupados por torre para encontrarlos rápido
  const torres = Object.entries(
    (lista ?? []).reduce((acc, a) => ({ ...acc, [a.torreNombre]: [...(acc[a.torreNombre] ?? []), a] }), {}),
  )

  return (
    <Field label="Apartamento" htmlFor="u-apartamento" required error={fallo ? `No se pudieron cargar los apartamentos: ${fallo}` : error}>
      <Select id="u-apartamento" value={value} onChange={(e) => onChange(e.target.value)} disabled={!lista} aria-invalid={Boolean(error)}>
        <option value="">{lista ? 'Elige un apartamento' : 'Cargando apartamentos…'}</option>
        {torres.map(([torre, aptos]) => (
          <optgroup key={torre} label={`Torre ${torre}`}>
            {aptos.map((a) => (
              <option key={a.id} value={a.id}>
                Apto {a.numero} · piso {a.piso}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </Field>
  )
}

Apartamentos.propTypes = { value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, error: PropTypes.string }

// Crear (usuario = null) o editar un usuario. Al crear, muestra las credenciales para entregarlas.
export default function FormularioUsuario({ usuario, rolInicial = 'RESIDENTE', onClose, onGuardado }) {
  const creando = !usuario
  const [rol, setRol] = useState(usuario?.rol ?? rolInicial)
  const [datos, setDatos] = useState(() => (usuario ? desdeUsuario(usuario) : vacio))
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [creado, setCreado] = useState(null)

  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: undefined }))
  }
  const alEscribir = (campo) => (e) => cambiar(campo)(e.target.value)

  const guardar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    const encontrados = validar(datos, rol, creando)
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setGuardando(true)
    try {
      const body = cuerpo(datos, rol, creando)
      const guardado = creando ? await usuariosApi.crear(body) : await usuariosApi.actualizar(usuario.id, body)
      onGuardado(guardado, creando)
      if (creando) setCreado({ usuario: guardado, contrasena: datos.contrasena })
      else onClose()
    } catch (err) {
      if (err.status === 409) setErrores({ correo: 'Ya hay una cuenta con este correo. Usa otro.' })
      else if (Object.keys(err.erroresCampo).length) setErrores(err.erroresCampo)
      else setErrorGeneral(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const otro = () => {
    setCreado(null)
    setDatos(vacio)
    setErrores({})
  }

  if (creado) {
    const personal = esPersonal(creado.usuario.rol)
    return (
      <Modal
        open
        onClose={onClose}
        title="Cuenta creada"
        subtitle={creado.usuario.nombreCompleto}
        icon={CheckCircle2}
        footer={
          <>
            <Button variant="secondary" onClick={otro} icon={UserPlus}>
              Crear otro usuario
            </Button>
            <Button onClick={onClose}>Listo</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Ya puede ingresar a ResiGest con estos datos como <span className="font-semibold text-slate-900">{infoRol(creado.usuario.rol).etiqueta.toLowerCase()}</span>.
        </p>
        <div className="mt-3">
          <Credencial correo={creado.usuario.correo} contrasena={creado.contrasena} mostrarContrasena />
        </div>
        <p className={cn('mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs', personal ? 'bg-slate-50 text-slate-600' : 'bg-warning-bg text-warning-strong')}>
          <Info className="mt-px size-4 shrink-0" />
          {personal
            ? 'Puedes volver a consultar esta contraseña cuando quieras desde el botón Acceso.'
            : 'Entrégasela ahora: por seguridad no se puede volver a consultar. Si la olvida, asígnale una nueva desde Acceso.'}
        </p>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={creando ? 'Crear usuario' : 'Editar usuario'}
      subtitle={creando ? 'El usuario entra a ResiGest con su correo y la contraseña que le asignes' : usuario.nombreCompleto}
      icon={creando ? UserPlus : Pencil}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={ID_FORM} disabled={guardando}>
            {guardando ? 'Guardando…' : creando ? 'Crear usuario' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form id={ID_FORM} onSubmit={guardar} noValidate className="space-y-5">
        {creando ? (
          <Field label="Rol" required>
            <SelectorRol rol={rol} onChange={(r) => { setRol(r); setErrores({}) }} />
          </Field>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            Rol:
            <ChipRol rol={rol} />
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" htmlFor="u-nombre" required error={errores.nombreCompleto} className="sm:col-span-2">
            <Input id="u-nombre" value={datos.nombreCompleto} onChange={alEscribir('nombreCompleto')} placeholder="Ej. Daniel Rojas Pérez" aria-invalid={Boolean(errores.nombreCompleto)} />
          </Field>
          <Field label="Documento" htmlFor="u-documento" required error={errores.documento}>
            <Input id="u-documento" inputMode="numeric" value={datos.documento} onChange={alEscribir('documento')} placeholder="Cédula" aria-invalid={Boolean(errores.documento)} />
          </Field>
          <Field label="Teléfono" htmlFor="u-telefono" error={errores.telefono}>
            <Input id="u-telefono" type="tel" value={datos.telefono} onChange={alEscribir('telefono')} placeholder="Ej. 300 123 4567" />
          </Field>
        </div>

        {rol === 'RESIDENTE' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Apartamentos value={datos.apartamentoId} onChange={cambiar('apartamentoId')} error={errores.apartamentoId} />
            <Field label="Tipo de residente" htmlFor="u-tipo" required>
              <Select id="u-tipo" value={datos.tipoResidente} onChange={alEscribir('tipoResidente')}>
                {Object.entries(tipoResidente).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>{etiqueta}</option>
                ))}
              </Select>
            </Field>
          </div>
        )}
        {rol === 'PORTERO' && (
          <Field label="Turno" htmlFor="u-turno" hint="Aparece junto a su nombre en el portal de portería.">
            <Select id="u-turno" value={datos.turno} onChange={alEscribir('turno')}>
              <option value="">Sin turno fijo</option>
              {turnosPorteria.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
        )}
        {rol === 'MANTENIMIENTO' && (
          <Field label="Especialidad" htmlFor="u-especialidad" hint="Elige una de la lista o escribe otra.">
            <Input id="u-especialidad" list="especialidades" value={datos.especialidad} onChange={alEscribir('especialidad')} placeholder="Ej. Plomería" />
            <datalist id="especialidades">
              {ESPECIALIDADES.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </Field>
        )}

        <fieldset className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <legend className="sr-only">Datos de acceso</legend>
          <p className="text-sm font-bold text-slate-900">Datos de acceso</p>
          <Field
            label="Correo (usuario)"
            htmlFor="u-correo"
            required
            error={errores.correo}
            hint={creando ? 'Es el usuario con el que inicia sesión.' : 'Si lo cambias, deberá ingresar con el nuevo correo.'}
          >
            <Input id="u-correo" type="email" autoComplete="off" value={datos.correo} onChange={alEscribir('correo')} placeholder="nombre@correo.com" aria-invalid={Boolean(errores.correo)} />
          </Field>
          {creando && (
            <Field
              label="Contraseña"
              htmlFor="u-contrasena"
              required
              error={errores.contrasena}
              hint={esPersonal(rol) ? 'Podrás consultarla después desde Acceso.' : 'Entrégasela al usuario: después no se podrá consultar.'}
            >
              <CampoContrasena id="u-contrasena" value={datos.contrasena} onChange={cambiar('contrasena')} invalido={Boolean(errores.contrasena)} />
            </Field>
          )}
        </fieldset>

        {errorGeneral && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger-strong">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {errorGeneral}
          </p>
        )}
      </form>
    </Modal>
  )
}

FormularioUsuario.propTypes = {
  usuario: PropTypes.object,
  rolInicial: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onGuardado: PropTypes.func.isRequired,
}
