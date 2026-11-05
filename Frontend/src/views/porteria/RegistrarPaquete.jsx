import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { AlertCircle, BellRing, Package } from 'lucide-react'
import { ArchivoProtegido, Button, CampoArchivo, Field, Input, Modal, Select } from '../../components/ui'
import CheckAnimado from '../../components/porteria/CheckAnimado'
import IlustracionPaquete from '../../components/paquetes/IlustracionPaquete'
import SelectApartamento from '../../components/inmueble/SelectApartamento'
import { subirArchivo } from '../../lib/api'
import { TAMANOS_PAQUETE, porteriaApi } from '../../lib/porteria'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'

const EMPRESAS = ['Servientrega', 'Interrapidísimo', 'Coordinadora', 'Envia', 'Mercado Libre', 'Amazon', 'Rappi', 'Otra']
const inicial = { empresa: 'Servientrega', otraEmpresa: '', guia: '', apartamentoId: '', tamano: 'Caja pequeña' }

export default function RegistrarPaquete({ open, onClose, onRegistrado }) {
  const { datos: apartamentos } = useCarga(porteriaApi.apartamentos, 'apartamentos')
  const [datos, setDatos] = useState(inicial)
  const [foto, setFoto] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [registrado, setRegistrado] = useState(null)

  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const cerrar = () => {
    onClose()
    setTimeout(() => {
      setRegistrado(null)
      setDatos(inicial)
      setFoto(null)
      setErrores({})
      setErrorGeneral('')
    }, 200)
  }

  const registrar = async (e) => {
    e.preventDefault()
    const empresa = datos.empresa === 'Otra' ? datos.otraEmpresa.trim() : datos.empresa
    const encontrados = {}
    if (!empresa) encontrados.otraEmpresa = 'Escribe el nombre de la empresa.'
    if (!datos.apartamentoId) encontrados.apartamentoId = 'Elige el apartamento de destino.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      // La foto se sube primero; el paquete guarda su dirección
      const fotoUrl = foto ? (await subirArchivo(foto)).url : null
      const paquete = await porteriaApi.registrarPaquete({
        apartamentoDestinoId: Number(datos.apartamentoId),
        empresaTransportadora: empresa,
        guia: datos.guia.trim() || null,
        tamano: datos.tamano,
        fotoUrl,
      })
      setRegistrado(paquete)
      onRegistrado?.(paquete)
    } catch (err) {
      setErrorGeneral(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      title={registrado ? 'Paquete registrado' : 'Registrar paquete'}
      subtitle={registrado ? undefined : 'Correspondencia recibida en portería'}
      icon={Package}
      footer={
        registrado ? (
          <Button onClick={cerrar}>Listo</Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit" form="form-paquete" disabled={guardando}>
              {guardando ? 'Registrando…' : 'Registrar paquete'}
            </Button>
          </>
        )
      }
    >
      {registrado ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckAnimado />
          <p className="text-base font-bold text-slate-900">Paquete registrado correctamente</p>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-3 rounded-xl bg-amber-50/70 p-3 text-left ring-1 ring-amber-100"
          >
            {registrado.fotoUrl ? (
              <ArchivoProtegido url={registrado.fotoUrl} alt="Foto del paquete" className="size-16 shrink-0" />
            ) : (
              <IlustracionPaquete descripcion={registrado.descripcion} className="h-14 w-16" />
            )}
            <div>
              <p className="text-base font-extrabold text-slate-900">{registrado.apartamento}</p>
              <p className="text-xs text-slate-500">
                {registrado.empresa}
                {registrado.guia && (
                  <>
                    {' '}
                    · <span className="font-mono">{registrado.guia}</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-warning-strong">Quedó en la estantería</p>
            </div>
          </motion.div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <BellRing className="size-4 text-brand-600" />
            Se le avisó al residente
          </p>
        </div>
      ) : (
        <form id="form-paquete" onSubmit={registrar} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Empresa de mensajería" htmlFor="paq-empresa" required>
              <Select id="paq-empresa" value={datos.empresa} onChange={(e) => cambiar('empresa')(e.target.value)}>
                {EMPRESAS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </Select>
            </Field>
            <Field label="N.º de guía" htmlFor="paq-guia" hint="Opcional">
              <Input id="paq-guia" value={datos.guia} onChange={(e) => cambiar('guia')(e.target.value)} placeholder="Ej. 2400318876" />
            </Field>
          </div>
          {datos.empresa === 'Otra' && (
            <Field label="¿Qué empresa?" htmlFor="paq-otra" required error={errores.otraEmpresa}>
              <Input id="paq-otra" value={datos.otraEmpresa} onChange={(e) => cambiar('otraEmpresa')(e.target.value)} placeholder="Nombre de la empresa" />
            </Field>
          )}
          <Field label="Apartamento" htmlFor="paq-apto" required error={errores.apartamentoId}>
            <SelectApartamento id="paq-apto" apartamentos={apartamentos} value={datos.apartamentoId} onChange={cambiar('apartamentoId')} invalido={Boolean(errores.apartamentoId)} />
          </Field>
          <Field label="Tamaño">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Tamaño del paquete">
              {TAMANOS_PAQUETE.map((t) => {
                const activo = datos.tamano === t
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => cambiar('tamano')(t)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl px-2 pb-2.5 pt-2 outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                      activo ? 'bg-brand-50/60 ring-2 ring-brand-500' : 'ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <IlustracionPaquete descripcion={t} className={cn('h-12 w-14 transition-transform', activo && '-translate-y-0.5')} />
                    <span className={cn('text-xs font-semibold', activo ? 'text-brand-700' : 'text-slate-600')}>{t}</span>
                  </button>
                )
              })}
            </div>
          </Field>
          <Field label="Foto del paquete" htmlFor="paq-foto" hint="Opcional. Ayuda al residente a reconocer su paquete.">
            <CampoArchivo id="paq-foto" value={foto} onChange={setFoto} texto="Toca para tomar o elegir una foto" />
          </Field>
          {errorGeneral && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger-strong">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorGeneral}
            </p>
          )}
        </form>
      )}
    </Modal>
  )
}

RegistrarPaquete.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegistrado: PropTypes.func,
}
