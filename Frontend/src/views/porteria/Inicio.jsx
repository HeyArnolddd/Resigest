import { useState } from 'react'
import { ClipboardList, DoorOpen, Package, PackagePlus } from 'lucide-react'
import { Button, Card, CardHeader, PageHeader } from '../../components/ui'
import { actividadPorteria, ingresos, paquetesPorteria } from '../../data/mock'
import RegistrarVisitante from './RegistrarVisitante'
import RegistrarPaquete from './RegistrarPaquete'

export default function Inicio() {
  const [modalVisitante, setModalVisitante] = useState(false)
  const [modalPaquete, setModalPaquete] = useState(false)
  const [ingresosLista, setIngresosLista] = useState(ingresos)
  const [paquetesLista, setPaquetesLista] = useState(paquetesPorteria)

  return (
    <div>
      <PageHeader
        title="Portería"
        subtitle="Control rápido de visitantes y correspondencia"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setModalVisitante(true)}
          className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-600/20">
            <DoorOpen className="h-7 w-7" strokeWidth={2} />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-bold text-slate-900">Registrar visitante</span>
            <span className="mt-0.5 block text-sm text-slate-500">
              Registra el ingreso de una persona o domicilio
            </span>
          </span>
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
            Abrir
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModalPaquete(true)}
          className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <PackagePlus className="h-7 w-7" strokeWidth={2} />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-bold text-slate-900">Registrar paquete</span>
            <span className="mt-0.5 block text-sm text-slate-500">
              Recibe y registra correspondencia del día
            </span>
          </span>
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
            Abrir
          </span>
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Ingresos recientes"
            subtitle="Últimas personas que ingresaron"
            action={
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {ingresosLista.length} hoy
              </span>
            }
          />
          <div className="px-5 py-2">
            {ingresosLista.map((i) => (
              <div key={i.id} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <DoorOpen className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.persona}</p>
                  <p className="text-xs text-slate-500">{i.apartamento} · {i.hora}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {i.tipo}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Paquetes recientes"
            subtitle="Correspondencia recibida"
            action={
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {paquetesLista.filter((p) => p.estado === 'Ha llegado').length} por entregar
              </span>
            }
          />
          <div className="px-5 py-2">
            {paquetesLista.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Package className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{p.empresa}</p>
                  <p className="text-xs text-slate-500">{p.apartamento} · {p.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Actividad de portería"
          subtitle="Resumen de la jornada"
          action={
            <Button variant="ghost" size="sm" icon={ClipboardList}>
              Ver bitácora
            </Button>
          }
        />
        <div className="px-5 py-2">
          {actividadPorteria.map((a, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
              <span className="w-11 text-xs font-semibold text-slate-400">{a.hora}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{a.accion}</p>
                <p className="text-xs text-slate-500">{a.detalle}</p>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {a.tipo}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <RegistrarVisitante
        open={modalVisitante}
        onClose={() => setModalVisitante(false)}
        onRegistrado={(d) => setIngresosLista((l) => [{ ...d, id: l.length + 1 }, ...l])}
      />
      <RegistrarPaquete
        open={modalPaquete}
        onClose={() => setModalPaquete(false)}
        onRegistrado={(d) => setPaquetesLista((l) => [d, ...l])}
      />
    </div>
  )
}