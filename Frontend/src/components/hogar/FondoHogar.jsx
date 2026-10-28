import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'
import * as M from './Muebles'

// Fondo de "interior de casa" del módulo residente: cada sección del menú es un cuarto.
// Pared, zócalo y piso cambian según el cuarto; en pantallas muy anchas los márgenes
// muestran sus muebles (arriba, colgados en la pared; abajo, apoyados en el piso).

const PISO = 110 // alto del piso
const ZOCALO = 150 // alto de los paneles sobre el piso

const paredes = {
  rayas: 'bg-[repeating-linear-gradient(90deg,transparent_0_46px,rgb(255_255_255/0.45)_46px_48px,transparent_48px_56px,rgb(255_255_255/0.25)_56px_57px)]',
  lisa: '',
}

const pisos = {
  madera: (
    <>
      <div className="absolute inset-0 bg-[#d9c9a8]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0_24px,rgb(120_90_50/0.18)_24px_26px)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_140px,rgb(120_90_50/0.14)_140px_142px)] [background-position:60px_0]" />
    </>
  ),
  cemento: (
    <>
      <div className="absolute inset-0 bg-[#d5d9d6]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.6)_2px,transparent_2px)] bg-[length:240px_100%] [background-position:80px_0]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgb(100_116_139/0.18)_1px,transparent_1.5px)] bg-[length:14px_14px]" />
    </>
  ),
  piedra: (
    <>
      <div className="absolute inset-0 bg-[#e5ddd0]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.8)_3px,transparent_3px),linear-gradient(90deg,rgb(255_255_255/0.8)_3px,transparent_3px)] bg-[length:90px_45px]" />
    </>
  ),
}

// Por cuarto: pared, piso, si lleva zócalo y los muebles de cada margen.
// `pared` va colgado arriba; `suelo` se apoya en el piso.
const salas = {
  inicio: {
    nombre: 'Sala',
    pared: 'rayas',
    piso: 'madera',
    zocalo: true,
    izquierda: { pared: [[M.Cuadros, 'max-w-40'], [M.Reloj, 'max-w-24']], suelo: [M.Sofa, 'max-w-52'] },
    derecha: { pared: [[M.Lampara, 'max-w-28'], [M.Ventana, 'max-w-40'], [M.Estante, 'max-w-36']], suelo: [M.MateraGrande, 'max-w-28'] },
  },
  finanzas: {
    nombre: 'Estudio',
    pared: 'lisa',
    piso: 'madera',
    zocalo: true,
    izquierda: { pared: [[M.Reloj, 'max-w-24'], [M.Calendario, 'max-w-28']], suelo: [M.Escritorio, 'max-w-52'] },
    derecha: { pared: [[M.Lampara, 'max-w-28']], suelo: [M.CajaFuerte, 'max-w-32'] },
  },
  reservas: {
    nombre: 'Terraza',
    pared: 'lisa',
    piso: 'piedra',
    zocalo: false,
    izquierda: { pared: [[M.Guirnalda, 'max-w-44'], [M.PlantaColgante, 'max-w-24']], suelo: [M.Asador, 'max-w-36'] },
    derecha: { pared: [[M.Guirnalda, 'max-w-44'], [M.Ventanal, 'max-w-44']], suelo: [M.MesaSombrilla, 'max-w-48'] },
  },
  incidencias: {
    nombre: 'Cuarto de herramientas',
    pared: 'lisa',
    piso: 'cemento',
    zocalo: false,
    izquierda: { pared: [[M.TableroHerramientas, 'max-w-44'], [M.RepisaPintura, 'max-w-40']], suelo: [M.BancoTrabajo, 'max-w-52'] },
    derecha: { pared: [[M.LamparaTaller, 'max-w-28'], [M.TableroElectrico, 'max-w-32']], suelo: [M.EscaleraTijera, 'max-w-40'] },
  },
  paquetes: {
    nombre: 'Recibidor',
    pared: 'rayas',
    piso: 'madera',
    zocalo: true,
    izquierda: { pared: [[M.Espejo, 'max-w-28'], [M.PortaLlaves, 'max-w-28']], suelo: [M.Perchero, 'max-w-28'] },
    derecha: { pared: [[M.Lampara, 'max-w-28'], [M.Reloj, 'max-w-24']], suelo: [M.PuertaPrincipal, 'max-w-44'] },
  },
  comunidad: {
    nombre: 'Comedor',
    pared: 'lisa',
    piso: 'madera',
    zocalo: true,
    izquierda: { pared: [[M.Banderines, 'max-w-44'], [M.Cartelera, 'max-w-44']], suelo: [M.EstacionCafe, 'max-w-48'] },
    derecha: { pared: [[M.LamparasTriples, 'max-w-40'], [M.Ventana, 'max-w-40', { vista: 'ciudad' }]], suelo: [M.MesaComedor, 'max-w-56'] },
  },
}

function Margen({ lado, contenido }) {
  const [Suelo, anchoSuelo] = contenido.suelo
  return (
    <div
      className={cn('absolute top-0 flex flex-col items-center justify-between', lado === 'izquierda' ? 'left-6' : 'right-6')}
      style={{ bottom: PISO - 14, width: 'calc((100% - 72rem) / 2 - 3rem)' }}
    >
      <div className="flex w-full flex-col items-center gap-14">
        {contenido.pared.map(([Mueble, ancho, extra], i) => (
          <Mueble key={i} className={cn('w-full', ancho)} {...extra} />
        ))}
      </div>
      <Suelo className={cn('w-full', anchoSuelo)} />
    </div>
  )
}

Margen.propTypes = { lado: PropTypes.string.isRequired, contenido: PropTypes.object.isRequired }

export default function FondoHogar({ sala, className }) {
  const s = salas[sala] ?? salas.inicio
  return (
    <div className={cn('pointer-events-none overflow-hidden', className)} aria-hidden="true">
      <div className={cn('absolute inset-0', paredes[s.pared])} />

      {s.zocalo && (
        <div className="absolute inset-x-0 border-t-[6px] border-white/80 bg-brand-100/60" style={{ bottom: PISO, height: ZOCALO }}>
          <div className="absolute inset-x-4 inset-y-5 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.55)_0_3px,transparent_3px_180px)]" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0" style={{ height: PISO }}>
        {pisos[s.piso]}
        <div className="absolute inset-x-0 top-0 h-3 bg-white" />
      </div>

      <div className="hidden min-[1760px]:block">
        <Margen lado="izquierda" contenido={s.izquierda} />
        <Margen lado="derecha" contenido={s.derecha} />
      </div>
    </div>
  )
}

FondoHogar.propTypes = { sala: PropTypes.string, className: PropTypes.string }
