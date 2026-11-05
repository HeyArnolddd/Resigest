import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { AlertCircle, BellRing, DoorOpen, Zap } from 'lucide-react'
import { Avatar, Button, Field, Input, Modal, Select } from '../../components/ui'
import CheckAnimado from '../../components/porteria/CheckAnimado'
import SelectApartamento from '../../components/inmueble/SelectApartamento'
import { estiloTipo, porteriaApi, tipoApi } from '../../lib/porteria'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'

const TIPOS = [
  ['Visitante', 'Familiar, amigo o invitado'],
  ['Domicilio', 'Comida, mercado o mensajería'],
  ['Servicio', 'Técnico de internet, gas, TV…'],
]
const EMPRESAS = {
  Domicilio: ['Rappi', 'DiDi Food', 'iFood', 'Domicilio del restaurante', 'Otra'],
  Servicio: ['Claro', 'Movistar', 'Tigo', 'ETB', 'Gas Natural', 'Otra'],
}
const inicial = { nombre: '', documento: '', apartamentoId: '', empresa: '' }

export default function RegistrarVisitante({ open, onClose, onRegistrado }) {
  const { datos: apartamentos } = useCarga(porteriaApi.apartamentos, 'apartamentos')
  const [tipo, setTipo] = useState('Visitante')
  const [entregaRapida, setEntregaRapida] = useState(false)
  const [datos, setDatos] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [registrado, setRegistrado] = useState(null)

  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const elegirTipo = (t) => {
    setTipo(t)
    setDatos((d) => ({ ...d, empresa: EMPRESAS[t]?.[0] ?? '' }))
  }

  const cerrar = () => {
    onClose()
    setTimeout(() => {
      setRegistrado(null)
      setTipo('Visitante')
      setEntregaRapida(false)
      setDatos(inicial)
      setErrores({})
      setErrorGeneral('')
    }, 200)
  }

  const registrar = async (e) => {
    e.preventDefault()
    const encontrados = {}
    if (!datos.nombre.trim()) encontrados.nombre = 'Escribe el nombre de quien ingresa.'
    if (!datos.apartamentoId) encontrados.apartamentoId = 'Elige a qué apartamento va.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      let ingreso = await porteriaApi.registrarIngreso({
        nombreVisitante: datos.nombre.trim(),
        documento: datos.documento.trim() || null,
        tipo: tipoApi(tipo),
        empresa: tipo === 'Visitante' ? null : datos.empresa || null,
        apartamentoDestinoId: Number(datos.apartamentoId),
      })
      // Entrega rápida: el domiciliario entrega en portería y se va de una vez
      if (tipo === 'Domicilio' && entregaRapida) {
        await porteriaApi.registrarSalida(ingreso.id)
        ingreso = { ...ingreso, dentro: false }
      }
      setRegistrado(ingreso)
      onRegistrado?.(ingreso)
    } catch (err) {
      if (Object.keys(err.erroresCampo).length) setErrorGeneral(Object.values(err.erroresCampo).join(' '))
      else setErrorGeneral(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      title={registrado ? 'Ingreso registrado' : 'Registrar visitante'}
      subtitle={registrado ? undefined : 'Diligencia los datos del ingreso'}
      icon={DoorOpen}
      footer={
        registrado ? (
          <Button onClick={cerrar}>Listo</Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit" form="form-visitante" disabled={guardando}>
              {guardando ? 'Registrando…' : 'Registrar ingreso'}
            </Button>
          </>
        )
      }
    >
      {registrado ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckAnimado />
          <p className="text-base font-bold text-slate-900">Ingreso registrado correctamente</p>
          {/* Gafete del ingreso */}
          <motion.div
            initial={{ opacity: 0, y: 10, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-64 overflow-hidden rounded-xl bg-white text-left shadow-lg ring-1 ring-slate-200"
          >
            <div className={cn('flex h-8 items-center px-3 text-[11px] font-bold', estiloTipo(registrado.tipo).banda)}>{registrado.tipo}</div>
            <div className="flex items-center gap-3 p-3">
              <Avatar nombre={registrado.persona} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{registrado.persona}</p>
                <p className="text-xs text-slate-500">
                  {registrado.apartamento} · {registrado.hora}
                </p>
              </div>
            </div>
          </motion.div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <BellRing className="size-4 text-brand-600" />
            Se le avisó al residente
          </p>
        </div>
      ) : (
        <form id="form-visitante" onSubmit={registrar} noValidate className="space-y-4">
          <Field label="Tipo de ingreso" required>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Tipo de ingreso">
              {TIPOS.map(([t, desc]) => {
                const estilo = estiloTipo(t)
                const Icono = estilo.icono
                const activo = tipo === t
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => elegirTipo(t)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-3 text-left outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                      activo ? 'bg-brand-50/60 ring-2 ring-brand-500' : 'ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg ring-1', estilo.icon)}>
                      <Icono className="size-5" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">{t}</span>
                      <span className="block text-[11px] leading-tight text-slate-500">{desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="vis-nombre" required error={errores.nombre}>
              <Input id="vis-nombre" value={datos.nombre} onChange={(e) => cambiar('nombre')(e.target.value)} placeholder="Nombre y apellido" />
            </Field>
            <Field label="Cédula" htmlFor="vis-doc" hint="Opcional">
              <Input id="vis-doc" inputMode="numeric" value={datos.documento} onChange={(e) => cambiar('documento')(e.target.value)} placeholder="1.234.567.890" />
            </Field>
          </div>
          <Field label="Apartamento" htmlFor="vis-apto" required error={errores.apartamentoId}>
            <SelectApartamento id="vis-apto" apartamentos={apartamentos} value={datos.apartamentoId} onChange={cambiar('apartamentoId')} invalido={Boolean(errores.apartamentoId)} />
          </Field>
          {tipo !== 'Visitante' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 overflow-hidden rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-100"
            >
              <Field label="Empresa" htmlFor="vis-empresa">
                <Select id="vis-empresa" value={datos.empresa} onChange={(e) => cambiar('empresa')(e.target.value)}>
                  {EMPRESAS[tipo].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </Select>
              </Field>
              {tipo === 'Domicilio' && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">
                    <span className="flex items-center gap-2 font-semibold">
                      <Zap className="size-4 text-amber-500" /> Entrega rápida
                    </span>
                    <span className="block text-xs text-slate-500">Deja el pedido en portería y se va de una vez</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={entregaRapida}
                    aria-label="Entrega rápida"
                    onClick={() => setEntregaRapida((v) => !v)}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                      entregaRapida ? 'bg-brand-600' : 'bg-slate-300',
                    )}
                  >
                    <span className={cn('absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform', entregaRapida && 'translate-x-full')} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
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

RegistrarVisitante.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegistrado: PropTypes.func,
}
