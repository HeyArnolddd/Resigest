import { useState } from 'react'
import { BellRing, CheckCircle2, DoorOpen } from 'lucide-react'
import { Button, Field, Input, Modal, Select } from '../../components/ui'

export default function RegistrarVisitante({ open, onClose, onRegistrado }) {
  const [registrado, setRegistrado] = useState(null)
  const [tipo, setTipo] = useState('Visitante')
  const [entregaRapida, setEntregaRapida] = useState(false)

  const cerrar = () => {
    onClose()
    setTimeout(() => {
      setRegistrado(null)
      setTipo('Visitante')
      setEntregaRapida(false)
    }, 200)
  }

  const registrar = (e) => {
    e.preventDefault()
    const datos = {
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      persona: e.target.nombre.value,
      apartamento: `${e.target.torre.value} · ${e.target.apartamento.value}`,
      tipo,
      estado: tipo === 'Domicilio' && entregaRapida ? 'Completado' : 'En portería',
    }
    setRegistrado(datos)
    onRegistrado?.(datos)
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      title={registrado ? 'Ingreso registrado' : 'Registrar visitante'}
      subtitle={registrado ? undefined : 'Diligenciar datos del ingreso'}
      icon={DoorOpen}
      footer={
        registrado ? (
          <Button onClick={cerrar}>Listo</Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit" form="form-visitante">
              Registrar ingreso
            </Button>
          </>
        )
      }
    >
      {registrado ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={2} />
          <p className="text-base font-bold text-slate-900">Ingreso registrado correctamente</p>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <DoorOpen className="h-3.5 w-3.5" />
            {registrado.persona} → {registrado.apartamento} · {registrado.hora}
          </div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <BellRing className="h-4 w-4 text-brand-600" />
            Notificación enviada al residente
          </p>
        </div>
      ) : (
        <form id="form-visitante" onSubmit={registrar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cédula" required>
              <Input name="cedula" placeholder="1.234.567.890" />
            </Field>
            <Field label="Nombre" required>
              <Input name="nombre" placeholder="Nombre y apellido" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Torre" required>
              <Select name="torre" defaultValue="T1">
                <option>Torre 1</option>
                <option>Torre 2</option>
                <option>Torre 3</option>
              </Select>
            </Field>
            <Field label="Apartamento" required>
              <Input name="apartamento" placeholder="Ej. 304" />
            </Field>
          </div>
          <Field label="Tipo de ingreso" required>
            <div className="grid grid-cols-2 gap-2">
              {['Visitante', 'Domicilio'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${
                    tipo === t
                      ? 'border-brand-400 bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          {tipo === 'Domicilio' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
              <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                Entrega rápida
                <button
                  type="button"
                  role="switch"
                  aria-checked={entregaRapida}
                  onClick={() => setEntregaRapida((v) => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${entregaRapida ? 'bg-brand-600' : 'bg-slate-300'}`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      entregaRapida ? 'translate-x-full' : ''
                    }`}
                  />
                </button>
              </label>
              <Field label="Empresa" hint="Entrega rápida: no espera al residente">
                <Select name="empresa" defaultValue="Rappi">
                  <option>Rappi</option>
                  <option>Uber Eats</option>
                  <option>Domicilios.com</option>
                  <option>Otra</option>
                </Select>
              </Field>
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}