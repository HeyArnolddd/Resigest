import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, CheckCircle2, Info, KeyRound } from 'lucide-react'
import { Button, Field, Modal } from '../ui'
import CampoContrasena from './CampoContrasena'
import Credencial from './Credencial'
import { esPersonal, usuariosApi } from '../../lib/usuarios'

function Esqueleto() {
  return (
    <div className="space-y-px overflow-hidden rounded-xl ring-1 ring-slate-100" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-3">
          <span className="size-4 animate-pulse rounded bg-slate-200" />
          <span className="h-8 flex-1 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

// Usuario y contraseña de una cuenta. Al personal de portería y mantenimiento se le puede
// consultar la contraseña; a residentes y administradores solo se les puede asignar una nueva.
export default function AccesoUsuario({ usuario, onClose }) {
  const personal = esPersonal(usuario.rol)
  const [credenciales, setCredenciales] = useState(null)
  const [errorCarga, setErrorCarga] = useState('')
  const [nueva, setNueva] = useState('')
  const [errorNueva, setErrorNueva] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [asignada, setAsignada] = useState(null)

  useEffect(() => {
    if (!personal) return
    let vigente = true
    usuariosApi
      .credenciales(usuario.id)
      .then((c) => vigente && setCredenciales(c))
      .catch((e) => vigente && setErrorCarga(e.message))
    return () => {
      vigente = false
    }
  }, [personal, usuario.id])

  const asignar = async (e) => {
    e.preventDefault()
    if (nueva.length < 6) {
      setErrorNueva('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setGuardando(true)
    setErrorNueva('')
    try {
      await usuariosApi.cambiarContrasena(usuario.id, nueva)
      if (personal) setCredenciales({ correo: usuario.correo, contrasena: nueva })
      setAsignada(nueva)
      setNueva('')
    } catch (err) {
      setErrorNueva(err.erroresCampo.contrasena ?? err.message)
    } finally {
      setGuardando(false)
    }
  }

  const sinCopia = personal && credenciales && !credenciales.contrasena

  return (
    <Modal
      open
      onClose={onClose}
      title="Acceso"
      subtitle={usuario.nombreCompleto}
      icon={KeyRound}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-5">
        <section aria-label="Credenciales actuales">
          {personal && !credenciales && !errorCarga && <Esqueleto />}
          {errorCarga && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-strong">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              No se pudieron cargar las credenciales: {errorCarga}
            </p>
          )}
          {personal && credenciales && (
            <Credencial key={credenciales.contrasena} correo={credenciales.correo} contrasena={credenciales.contrasena ?? undefined} mostrarContrasena={Boolean(asignada)} />
          )}
          {!personal && <Credencial correo={usuario.correo} contrasena={asignada ?? undefined} mostrarContrasena />}

          {sinCopia && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-bg px-3 py-2.5 text-xs text-warning-strong">
              <Info className="mt-px size-4 shrink-0" />
              Esta cuenta se creó antes de que ResiGest guardara las contraseñas del personal. Asígnale una nueva para poder consultarla.
            </p>
          )}
          {!personal && !asignada && (
            <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
              <Info className="mt-px size-4 shrink-0" />
              Por seguridad, la contraseña de residentes y administradores no se puede consultar. Si la olvidó, asígnale una nueva.
            </p>
          )}
          {asignada && (
            <p role="status" className="mt-3 flex items-start gap-2 rounded-lg bg-success-bg px-3 py-2.5 text-xs font-medium text-success-strong">
              <CheckCircle2 className="mt-px size-4 shrink-0" />
              Contraseña actualizada. La anterior ya no sirve para ingresar.
            </p>
          )}
        </section>

        <form onSubmit={asignar} noValidate className="space-y-3 border-t border-slate-100 pt-5">
          <Field label="Asignar una contraseña nueva" htmlFor="acceso-nueva" error={errorNueva}>
            <CampoContrasena id="acceso-nueva" value={nueva} onChange={(v) => { setNueva(v); setErrorNueva('') }} invalido={Boolean(errorNueva)} />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" variant="outline" icon={KeyRound} disabled={guardando || !nueva}>
              {guardando ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

AccesoUsuario.propTypes = {
  usuario: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}
