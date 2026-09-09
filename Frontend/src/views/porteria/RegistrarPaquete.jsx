import { useState } from 'react'
import { BellRing, CheckCircle2, Package } from 'lucide-react'
import { Button, Field, Input, Modal, Select, StatusBadge } from '../../components/ui'

export default function RegistrarPaquete({ open, onClose, onRegistrado }) {
  const [registrado, setRegistrado] = useState(null)

  const cerrar = () => {
    onClose()
    setTimeout(() => setRegistrado(null), 200)
  }

  const registrar = (e) => {
    e.preventDefault()
    const datos = {
      id: `PAQ-2${Math.floor(30 + Math.random() * 8)}`,
      empresa: e.target.empresa.value,
      guia: e.target.guia.value,
      apartamento: `${e.target.torre.value} · ${e.target.apartamento.value}`,
      fecha: `${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
      descripcion: e.target.descripcion.value || 'Sin descripción',
      estado: 'Ha llegado',
    }
    setRegistrado(datos)
    onRegistrado?.(datos)
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
            <Button type="submit" form="form-paquete">
              Registrar paquete
            </Button>
          </>
        )
      }
    >
      {registrado ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={2} />
          <p className="text-base font-bold text-slate-900">Paquete registrado correctamente</p>
          <StatusBadge status={registrado.estado} />
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <BellRing className="h-4 w-4 text-brand-600" />
            Se generó una notificación al residente
          </p>
        </div>
      ) : (
        <form id="form-paquete" onSubmit={registrar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Empresa de mensajería" required>
              <Select name="empresa" defaultValue="Rappi">
                <option>Rappi</option>
                <option>Mercado Libre</option>
                <option>Amazon</option>
                <option>Domicilios.com</option>
                <option>Envia</option>
                <option>Otra</option>
              </Select>
            </Field>
            <Field label="N.º de guía" required>
              <Input name="guia" placeholder="Ej. RP-4829137" />
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
          <Field label="Descripción">
            <Input name="descripcion" placeholder="Ej. Caja pequeña, paquete mediano…" />
          </Field>
        </form>
      )}
    </Modal>
  )
}