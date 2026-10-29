export const residente = {
  nombre: 'Juan Pérez',
  torre: 'Torre 2',
  apto: '304',
  email: 'juan.perez@correo.co',
  celular: '+57 300 123 4567',
}

// ── Cartera del apartamento del residente (forma de ObligacionDTO / PagoDTO del API_CONTRACT) ──
// La cuota de cada mes vence el día 5 del mes siguiente; el agua se cobra cada dos meses.

// [periodo, concepto, montoTotal, estado]
const cartera = [
  ['2025-11', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2025-11', 'SERVICIO_PUBLICO', 47300, 'PAGADA'],
  ['2025-12', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-01', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-01', 'SERVICIO_PUBLICO', 51600, 'PAGADA'],
  ['2026-02', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-03', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-03', 'SERVICIO_PUBLICO', 46900, 'PAGADA'],
  ['2026-04', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-05', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-05', 'SERVICIO_PUBLICO', 53300, 'PAGADA'],
  ['2026-06', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-07', 'CUOTA_ADMINISTRACION', 160000, 'PAGADA'],
  ['2026-07', 'SERVICIO_PUBLICO', 49800, 'PAGADA'],
  ['2026-08', 'CUOTA_ADMINISTRACION', 160000, 'EN_VERIFICACION'],
  ['2026-09', 'CUOTA_ADMINISTRACION', 160000, 'VENCIDA'],
  ['2026-09', 'SERVICIO_PUBLICO', 52400, 'PAGADA'],
  ['2026-10', 'CUOTA_ADMINISTRACION', 160000, 'PENDIENTE'],
]

const vencimiento = (periodo) => {
  const [a, m] = periodo.split('-').map(Number)
  return m === 12 ? `${a + 1}-01-05` : `${a}-${String(m + 1).padStart(2, '0')}-05`
}

export const obligacionesApto = cartera.map(([periodo, concepto, montoTotal, estado], i) => ({
  id: 300 + i,
  concepto,
  periodo,
  montoTotal,
  saldoPendiente: estado === 'PAGADA' ? 0 : montoTotal,
  estado,
  fechaVencimiento: vencimiento(periodo),
}))

// Pagos del apartamento; las obligaciones pagadas por Wompi tienen referencia PAGO-…
export const pagosApto = obligacionesApto
  .filter((o) => ['PAGADA', 'EN_VERIFICACION'].includes(o.estado))
  .map((o, i) => {
    const manual = o.estado === 'EN_VERIFICACION' || i % 4 === 3
    const [a, m] = o.fechaVencimiento.split('-')
    return {
      id: 500 + i,
      metodo: manual ? 'TRANSFERENCIA' : 'WOMPI',
      monto: o.montoTotal,
      estado: o.estado === 'EN_VERIFICACION' ? 'EN_VERIFICACION' : 'APROBADO',
      fecha: `${a}-${m}-0${(i % 4) + 1}T${10 + (i % 8)}:${String((i * 17) % 60).padStart(2, '0')}:00`,
      obligacionId: o.id,
      referencia: manual ? `TRF-${88420 + i * 37}` : `PAGO-${(7731 + i * 211).toString(36).toUpperCase()}`,
    }
  })
  .reverse()

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const ddmmaaaa = (iso) => iso.split('-').reverse().join('/')

// Vista simplificada que usa el Inicio: las últimas seis cuotas de administración.
export const obligaciones = obligacionesApto
  .filter((o) => o.concepto === 'CUOTA_ADMINISTRACION')
  .slice(-6)
  .reverse()
  .map((o) => {
    const [a, m] = o.periodo.split('-')
    return {
      id: `OB-${o.id}`,
      concepto: 'Cuota de administración',
      periodo: `${MESES_CORTOS[Number(m) - 1]} ${a}`,
      valor: o.montoTotal,
      vencimiento: ddmmaaaa(o.fechaVencimiento),
      estado: o.estado === 'PAGADA' ? 'Pagada' : o.estado === 'EN_VERIFICACION' ? 'En verificación' : 'Pendiente',
    }
  })

export const saldoPendiente = obligacionesApto
  .filter((o) => ['PENDIENTE', 'VENCIDA'].includes(o.estado))
  .reduce((total, o) => total + o.saldoPendiente, 0)

export const zonasComunes = [
  { id: 'salon', nombre: 'Salón Social', capacidad: '60 personas', horarios: ['08:00 - 12:00', '14:00 - 18:00', '18:00 - 22:00'] },
  { id: 'piscina', nombre: 'Piscina', capacidad: '40 personas', horarios: ['08:00 - 11:00', '13:00 - 16:00', '16:00 - 19:00'] },
  { id: 'parrillas', nombre: 'Zona de parrillas', capacidad: '30 personas', horarios: ['12:00 - 16:00', '18:00 - 22:00'] },
  { id: 'gimnasio', nombre: 'Gimnasio', capacidad: '10 personas', horarios: ['06:00 - 08:00', '18:00 - 21:00'] },
  { id: 'parque', nombre: 'Parque infantil', capacidad: '20 personas', horarios: ['09:00 - 12:00', '15:00 - 18:00'] },
]

export const reservas = [
  { id: 'RSV-104', zona: 'Salón Social', fecha: '12/09/2026', horario: '14:00 - 18:00', estado: 'Pendiente' },
  { id: 'RSV-099', zona: 'Salón Social', fecha: '08/09/2026', horario: '08:00 - 12:00', estado: 'Aprobada' },
  { id: 'RSV-088', zona: 'Zona de parrillas', fecha: '30/08/2026', horario: '18:00 - 22:00', estado: 'Aprobada' },
  { id: 'RSV-071', zona: 'Gimnasio', fecha: '15/08/2026', horario: '06:00 - 08:00', estado: 'Rechazada' },
]

export const incidencias = [
  {
    id: 'INC-015',
    titulo: 'Puerta del acceso al roof bloqueada',
    categoria: 'Carpintería',
    ubicacion: 'Torre 3 · Roof',
    fecha: '08/09/2026',
    prioridad: 'Media',
    estado: 'Nueva',
    solicitante: 'Valentina López',
    descripcion:
      'La puerta que da acceso a la terraza del piso 12 no abre con el sistema de tarjeta.',
    evidencia: false,
  },
  {
    id: 'INC-014',
    titulo: 'Grifo del lavadero comunitario gotea',
    categoria: 'Plomería',
    ubicacion: 'Torre 1 · Piso 1',
    fecha: '08/09/2026',
    prioridad: 'Baja',
    estado: 'Nueva',
    solicitante: 'Luis Ramírez',
    descripcion:
      'El grifo del lavadero comunitario presenta un goteo constante y consume agua.',
    evidencia: false,
  },
  {
    id: 'INC-013',
    titulo: 'Fuga de agua en el baño de la ducha',
    categoria: 'Plomería',
    ubicacion: 'Torre 2 · Apto 304',
    fecha: '07/09/2026',
    prioridad: 'Alta',
    estado: 'En proceso',
    solicitante: 'Juan Pérez',
    descripcion:
      'Se presenta un goteo constante en la ducha del baño principal, incluso con la llave cerrada. La zona aledaña a la tubería se ve humedecida.',
    evidencia: true,
  },
  {
    id: 'INC-012',
    titulo: 'El ascensor 1 emite un ruido fuerte',
    categoria: 'Ascensores',
    ubicacion: 'Torre 1 · Lobby',
    fecha: '05/09/2026',
    prioridad: 'Media',
    estado: 'Nueva',
    solicitante: 'Carlos Rodríguez',
    descripcion:
      'Al llegar al piso 3 el ascensor 1 presenta un ruido metálico y vibración. Se recomienda revisión preventiva.',
    evidencia: false,
  },
  {
    id: 'INC-011',
    titulo: 'Luminaria apagada en el parque infantil',
    categoria: 'Iluminación',
    ubicacion: 'Parque infantil',
    fecha: '04/09/2026',
    prioridad: 'Baja',
    estado: 'Nueva',
    solicitante: 'Ana Gómez',
    descripcion: 'La luminaria del costado norte del parque infantil no enciende desde hace tres días.',
    evidencia: false,
  },
  {
    id: 'INC-010',
    titulo: 'Cerradura de la puerta principal en mal estado',
    categoria: 'Carpintería',
    ubicacion: 'Torre 2 · Apto 304',
    fecha: '02/09/2026',
    prioridad: 'Media',
    estado: 'Nueva',
    solicitante: 'Juan Pérez',
    descripcion: 'La cerradura de la puerta principal gira con dificultad y a veces se queda trabada.',
    evidencia: true,
  },
  {
    id: 'INC-009',
    titulo: 'Humedad en el muro del hall del piso 2',
    categoria: 'Plomería',
    ubicacion: 'Torre 1 · Piso 2',
    fecha: '29/08/2026',
    prioridad: 'Alta',
    estado: 'En proceso',
    solicitante: 'María Fernández',
    descripcion: 'Se observa una mancha de humedad creciente en el muro del hall, frente al ascensor.',
    evidencia: true,
  },
  {
    id: 'INC-008',
    titulo: 'Rejilla del sumidero suelta',
    categoria: 'Zonas comunes',
    ubicacion: 'Parqueadero · Nivel -1',
    fecha: '27/08/2026',
    prioridad: 'Media',
    estado: 'Nueva',
    solicitante: 'Pedro Suárez',
    descripcion: 'La rejilla del sumidero al lado de la entrada vehicular está suelta y representa un riesgo.',
    evidencia: true,
  },
  {
    id: 'INC-007',
    titulo: 'Refrigerador de la portería no enfría',
    categoria: 'Equipos',
    ubicacion: 'Portería principal',
    fecha: '25/08/2026',
    prioridad: 'Media',
    estado: 'Nueva',
    solicitante: 'Daniel Rojas',
    descripcion: 'El refrigerador de la portería no alcanza la temperatura adecuada.',
    evidencia: false,
  },
  {
    id: 'INC-006',
    titulo: 'Ventanal del gimnasio con vidrio en riesgo',
    categoria: 'Vidriería',
    ubicacion: 'Gimnasio',
    fecha: '22/08/2026',
    prioridad: 'Alta',
    estado: 'Nueva',
    solicitante: 'Sofía Torres',
    descripcion: 'El ventanal del gimnasio presenta una fisura en la esquina superior derecha.',
    evidencia: true,
  },
  {
    id: 'INC-005',
    titulo: 'Sensor de la puerta del parqueadero',
    categoria: 'Eléctrico',
    ubicacion: 'Acceso parqueadero',
    fecha: '20/08/2026',
    prioridad: 'Media',
    estado: 'En proceso',
    solicitante: 'Administración',
    descripcion: 'El sensor de aproximación de la reja del parqueadero falla de manera intermitente.',
    evidencia: false,
  },
  {
    id: 'INC-004',
    titulo: 'Pintura descascarada en la fachada',
    categoria: 'Pintura',
    ubicacion: 'Torre 3 · Fachada',
    fecha: '15/08/2026',
    prioridad: 'Baja',
    estado: 'Resuelta',
    solicitante: 'Carlos Rodríguez',
    descripcion: 'Se aprecia la pintura descascarada en la fachada, cerca de la entrada de la torre 3.',
    evidencia: false,
  },
  {
    id: 'INC-003',
    titulo: 'Filtración desde el techo del parqueadero',
    categoria: 'Cubierta',
    ubicacion: 'Parqueadero · Nivel -2',
    fecha: '11/08/2026',
    prioridad: 'Alta',
    estado: 'Resuelta',
    solicitante: 'Pedro Suárez',
    descripcion: 'Filtración de agua desde el techo en el sector B del parqueadero.',
    evidencia: true,
  },
  {
    id: 'INC-002',
    titulo: 'Pasto alto en la zona verde',
    categoria: 'Jardinería',
    ubicacion: 'Zona verde central',
    fecha: '06/08/2026',
    prioridad: 'Baja',
    estado: 'Resuelta',
    solicitante: 'Ana Gómez',
    descripcion: 'El césped de la zona verde central requiere corte y mantenimiento.',
    evidencia: false,
  },
  {
    id: 'INC-001',
    titulo: 'Bombilla quemada en el pasillo del piso 4',
    categoria: 'Iluminación',
    ubicacion: 'Torre 2 · Piso 4',
    fecha: '30/07/2026',
    prioridad: 'Baja',
    estado: 'Resuelta',
    solicitante: 'Juan Pérez',
    descripcion: 'La bombilla del pasillo del piso 4 está quemada desde hace una semana.',
    evidencia: false,
  },
  {
    id: 'INC-000',
    titulo: 'Toma eléctrica en corto del hall',
    categoria: 'Eléctrico',
    ubicacion: 'Torre 2 · Piso 1',
    fecha: '25/07/2026',
    prioridad: 'Alta',
    estado: 'Resuelta',
    solicitante: 'Administración',
    descripcion: 'La toma eléctrica del hall principal presentaba chispas al conectar.',
    evidencia: false,
  },
]

export const paquetes = [
  { id: 'PAQ-231', empresa: 'Rappi', guia: 'RP-4829137', torre: '2', apto: '304', descripcion: 'Caja pequeña', fecha: '09/09/2026', estado: 'Ha llegado' },
  { id: 'PAQ-227', empresa: 'Mercado Libre', guia: 'ML-9912374', torre: '2', apto: '304', descripcion: 'Paquete mediano', fecha: '08/09/2026', estado: 'Ha llegado' },
  { id: 'PAQ-219', empresa: 'Domicilios.com', guia: 'DC-5581231', torre: '2', apto: '304', descripcion: 'Sobre', fecha: '28/08/2026', estado: 'Entregado' },
  { id: 'PAQ-203', empresa: 'Amazon', guia: 'AMZ-1183742', torre: '2', apto: '304', descripcion: 'Caja grande', fecha: '14/07/2026', estado: 'Entregado' },
  { id: 'PAQ-188', empresa: 'Envia', guia: 'EV-7731200', torre: '2', apto: '304', descripcion: 'Paquete mediano', fecha: '02/06/2026', estado: 'No ha llegado' },
]

export const notificaciones = [
  { id: 1, tipo: 'paquete', titulo: 'Tienes un paquete en portería', detalle: 'Rappi · Guía RP-4829137 · Recógelo en horario de portería', fecha: 'Hoy · 10:04', leida: false },
  { id: 2, tipo: 'reserva', titulo: 'Reserva en revisión', detalle: 'Tu solicitud del Salón Social (12/09) está pendiente de aprobación.', fecha: 'Hoy · 08:12', leida: false },
  { id: 3, tipo: 'incidencia', titulo: 'Actualización de tu incidencia', detalle: 'INC-013 pasó a estado "En proceso".', fecha: 'Ayer', leida: false },
  { id: 4, tipo: 'comunicado', titulo: 'Nuevo comunicado', detalle: 'Mantenimiento de ascensores el jueves.', fecha: '08/09/2026', leida: true },
]

export const comunicados = [
  { id: 1, titulo: 'Mantenimiento de ascensores', categoria: 'Aviso', fecha: '08/09/2026', contenido: 'El jueves 10 de septiembre se realizará mantenimiento preventivo a los ascensores de las torres 1 y 2 entre las 9:00 a. m. y la 1:00 p. m.' },
  { id: 2, titulo: 'Asamblea de copropietarios 2026', categoria: 'Asamblea', fecha: '01/09/2026', contenido: 'Los invitamos a la asamblea anual de copropietarios el sábado 19 de septiembre a las 9:00 a. m. en el salón social.' },
  { id: 3, titulo: 'Nuevo horario de la piscina', categoria: 'Zonas comunes', fecha: '27/08/2026', contenido: 'Desde septiembre la piscina amplía su horario en la franja de la tarde: 1:00 p. m. a 7:00 p. m.' },
]

export const mensajesComunidad = [
  { id: 1, autor: 'Ana Gómez', torre: 'T1 · 204', hora: '09:42', texto: '¿Alguien sabe cuándo hacen entrega de los nuevos carnés de acceso?' },
  { id: 2, autor: 'Carlos Rodríguez', torre: 'T3 · 502', hora: '09:47', texto: 'Me dijeron en portería que los entregan la próxima semana.' },
  { id: 3, autor: 'María Fernández', torre: 'T1 · 101', hora: '10:05', texto: 'Confirmado, el lunes desde las 8:00 a. m. en la administración.' },
  { id: 4, autor: 'Juan Pérez', torre: 'T2 · 304', hora: '10:12', texto: 'Gracias por la información. ¿Hay algún documento que deba llevar?' },
]

// Mensajes privados entre residentes (forma de MensajeChatDTO). Juan Pérez es el usuario 1.
export const vecinosChat = [
  { id: 2, nombre: 'Ana Gómez', apartamento: 'T1 · 204' },
  { id: 3, nombre: 'Carlos Rodríguez', apartamento: 'T3 · 502' },
  { id: 4, nombre: 'María Fernández', apartamento: 'T1 · 101' },
  { id: 5, nombre: 'Luis Ramírez', apartamento: 'T1 · 102' },
  { id: 6, nombre: 'Sofía Torres', apartamento: 'T2 · 208' },
  { id: 7, nombre: 'Camilo Ortiz', apartamento: 'T2 · 111' },
  { id: 8, nombre: 'Laura Martínez', apartamento: 'T2 · 305' },
]

export const mensajesPrivados = [
  { id: 101, remitenteId: 1, destinatarioId: 6, contenido: 'Sofía, ¿vas a ir a la asamblea del 19?', fecha: '2026-09-08T19:05:00' },
  { id: 102, remitenteId: 6, destinatarioId: 1, contenido: 'Sí, nos vemos allá.', fecha: '2026-09-08T19:40:00' },
  { id: 103, remitenteId: 2, destinatarioId: 1, contenido: 'Hola Juan, ¿me prestas la escalera el sábado?', fecha: '2026-09-09T08:15:00' },
  { id: 104, remitenteId: 1, destinatarioId: 2, contenido: '¡Claro! Pasa por ella en la mañana.', fecha: '2026-09-09T08:20:00' },
  { id: 105, remitenteId: 2, destinatarioId: 1, contenido: 'Mil gracias, a las 9 paso por el 304.', fecha: '2026-09-09T08:22:00' },
  { id: 106, remitenteId: 8, destinatarioId: 1, contenido: 'Vecino, creo que un paquete tuyo quedó en mi casillero.', fecha: '2026-09-09T10:31:00' },
  { id: 107, remitenteId: 8, destinatarioId: 1, contenido: 'Es de Mercado Libre, te lo dejo en portería.', fecha: '2026-09-09T10:32:00' },
]

// Agenda del conjunto (los mocks toman el 09/09/2026 como "hoy")
export const eventosConjunto = [
  { id: 1, tipo: 'mantenimiento', titulo: 'Mantenimiento de ascensores', fecha: '2026-09-10', hora: '09:00 – 13:00', lugar: 'Torres 1 y 2' },
  { id: 2, tipo: 'tramite', titulo: 'Entrega de carnés de acceso', fecha: '2026-09-14', hora: '08:00 – 17:00', lugar: 'Administración' },
  { id: 3, tipo: 'asamblea', titulo: 'Asamblea de copropietarios', fecha: '2026-09-19', hora: '09:00', lugar: 'Salón social' },
  { id: 4, tipo: 'evento', titulo: 'Bingo familiar', fecha: '2026-09-26', hora: '16:00', lugar: 'Salón social' },
]

export const contactosConjunto = [
  { id: 'porteria', nombre: 'Portería', horario: 'Las 24 horas', telefono: '+57 607 645 1020' },
  { id: 'administracion', nombre: 'Administración', horario: 'Lun a vie · 08:00 – 17:00', telefono: '+57 607 645 1021' },
  { id: 'mantenimiento', nombre: 'Mantenimiento', horario: 'Lun a sáb · 07:00 – 16:00', telefono: '+57 607 645 1022' },
  { id: 'emergencias', nombre: 'Emergencias', horario: 'Línea nacional', telefono: '123' },
]

export const ingresos = [
  { id: 1, hora: '10:24', persona: 'Laura Martínez', apartamento: 'T2 · 305', tipo: 'Visitante', estado: 'En portería' },
  { id: 2, hora: '09:58', persona: 'Repartidor Rappi', apartamento: 'T3 · 501', tipo: 'Domicilio', estado: 'Completado' },
  { id: 3, hora: '09:31', persona: 'Pedro Sánchez', apartamento: 'T1 · 103', tipo: 'Visitante', estado: 'Completado' },
  { id: 4, hora: '09:12', persona: 'Repartidor Uber Eats', apartamento: 'T2 · 208', tipo: 'Domicilio', estado: 'Completado' },
  { id: 5, hora: '08:47', persona: 'Técnico de TV', apartamento: 'T3 · 410', tipo: 'Servicio', estado: 'Completado' },
  { id: 6, hora: '08:02', persona: 'Valentina López', apartamento: 'T1 · 201', tipo: 'Visitante', estado: 'Completado' },
]

export const paquetesPorteria = [
  { id: 'PAQ-231', empresa: 'Rappi', guia: 'RP-4829137', apartamento: 'T2 · 304', descripcion: 'Caja pequeña', fecha: '09/09/2026 · 10:04', estado: 'Ha llegado' },
  { id: 'PAQ-230', empresa: 'Domicilios.com', guia: 'DC-5587721', apartamento: 'T1 · 102', descripcion: 'Sobre', fecha: '09/09/2026 · 09:22', estado: 'Entregado' },
  { id: 'PAQ-229', empresa: 'Mercado Libre', guia: 'ML-8839201', apartamento: 'T3 · 501', descripcion: 'Paquete mediano', fecha: '08/09/2026 · 16:45', estado: 'Entregado' },
  { id: 'PAQ-228', empresa: 'Amazon', guia: 'AMZ-6620183', apartamento: 'T1 · 403', descripcion: 'Caja grande', fecha: '08/09/2026 · 14:20', estado: 'Ha llegado' },
  { id: 'PAQ-227', empresa: 'Mercado Libre', guia: 'ML-9912374', apartamento: 'T2 · 304', descripcion: 'Paquete mediano', fecha: '08/09/2026 · 11:03', estado: 'Ha llegado' },
  { id: 'PAQ-226', empresa: 'Amazon', guia: 'AMZ-7738291', apartamento: 'T1 · 205', descripcion: 'Caja grande', fecha: '07/09/2026 · 15:18', estado: 'Entregado' },
  { id: 'PAQ-225', empresa: 'Envia', guia: 'EV-4410298', apartamento: 'T3 · 202', descripcion: 'Sobre', fecha: '07/09/2026 · 09:47', estado: 'Ha llegado' },
]

export const actividadPorteria = [
  { hora: '10:24', accion: 'Ingreso de visitante', detalle: 'Laura Martínez → T2 · 305', tipo: 'Visitante' },
  { hora: '10:04', accion: 'Paquete registrado', detalle: 'Rappi → T2 · 304', tipo: 'Paquete' },
  { hora: '09:58', accion: 'Entrega rápida', detalle: 'Rappi → T3 · 501', tipo: 'Domicilio' },
  { hora: '09:31', accion: 'Ingreso de visitante', detalle: 'Pedro Sánchez → T1 · 103', tipo: 'Visitante' },
  { hora: '09:22', accion: 'Paquete entregado', detalle: 'Domicilios.com → T1 · 102', tipo: 'Paquete' },
]

export const pagosManuales = [
  { id: 'PM-091', residente: 'Luis Ramírez', apartamento: 'T1 · 102', valor: 160000, fecha: '08/09/2026', banco: 'Bancolombia', numeroConsignacion: 'CMS-8842210', estado: 'Pendiente revisión', comprobante: 'Comprobante_PM-091.pdf' },
  { id: 'PM-090', residente: 'María Fernández', apartamento: 'T1 · 101', valor: 160000, fecha: '07/09/2026', banco: 'Nequi', numeroConsignacion: 'NE-5520193', estado: 'Pendiente revisión', comprobante: 'Comprobante_PM-090.jpeg' },
  { id: 'PM-089', residente: 'Pedro Suárez', apartamento: 'T3 · 410', valor: 160000, fecha: '06/09/2026', banco: 'Daviplata', numeroConsignacion: 'DP-1120834', estado: 'Pendiente revisión', comprobante: 'Comprobante_PM-089.pdf' },
  { id: 'PM-088', residente: 'Sofía Torres', apartamento: 'T2 · 208', valor: 160000, fecha: '05/09/2026', banco: 'Bancolombia', numeroConsignacion: 'CMS-8431200', estado: 'Pendiente revisión', comprobante: 'Comprobante_PM-088.jpeg' },
  { id: 'PM-087', residente: 'Camilo Ortiz', apartamento: 'T2 · 111', valor: 160000, fecha: '04/09/2026', banco: 'Banco de Bogotá', numeroConsignacion: 'BB-9982715', estado: 'Pendiente revisión', comprobante: 'Comprobante_PM-087.pdf' },
]

export const reservasPendientes = [
  { id: 'RSV-104', residente: 'Juan Pérez', apartamento: 'T2 · 304', zona: 'Salón Social', fecha: '12/09/2026', horario: '14:00 - 18:00', estado: 'Pendiente' },
  { id: 'RSV-103', residente: 'Andrés Mora', apartamento: 'T3 · 302', zona: 'Piscina', fecha: '11/09/2026', horario: '13:00 - 16:00', estado: 'Pendiente' },
  { id: 'RSV-102', residente: 'Marcela Ruiz', apartamento: 'T1 · 402', zona: 'Zona de parrillas', fecha: '10/09/2026', horario: '18:00 - 22:00', estado: 'Pendiente' },
]

export const residentes = [
  { id: 1, nombre: 'Juan Pérez', apartamento: 'T2 · 304', celular: '+57 300 123 4567', estadoCuenta: '$320.000 · 2 meses', estado: 'Activo' },
  { id: 2, nombre: 'Ana Gómez', apartamento: 'T1 · 204', celular: '+57 310 887 2210', estadoCuenta: 'Al día', estado: 'Activo' },
  { id: 3, nombre: 'Carlos Rodríguez', apartamento: 'T3 · 502', celular: '+57 315 442 9081', estadoCuenta: 'Al día', estado: 'Activo' },
  { id: 4, nombre: 'María Fernández', apartamento: 'T1 · 101', celular: '+57 320 654 1122', estadoCuenta: '$160.000 · 1 mes', estado: 'Activo' },
  { id: 5, nombre: 'Luis Ramírez', apartamento: 'T1 · 102', celular: '+57 301 220 7788', estadoCuenta: '$320.000 · 2 meses', estado: 'Activo' },
  { id: 6, nombre: 'Pedro Suárez', apartamento: 'T3 · 410', celular: '+57 317 998 3321', estadoCuenta: '$160.000 · 1 mes', estado: 'Activo' },
  { id: 7, nombre: 'Sofía Torres', apartamento: 'T2 · 208', celular: '+57 311 445 9900', estadoCuenta: '$160.000 · 1 mes', estado: 'Activo' },
  { id: 8, nombre: 'Camilo Ortiz', apartamento: 'T2 · 111', celular: '+57 314 771 2054', estadoCuenta: 'Al día', estado: 'Activo' },
]

// Estado de cartera del conjunto (120 apartamentos)
export const carteraConjunto = { apartamentos: 120, alDia: 98, enMora: 22, saldoMora: 5120000 }

// Cuotas de administración por mes, en millones: lo facturado y lo que efectivamente se recaudó
export const recaudoMensual = [
  { mes: 'Abr', facturado: 4.6, valor: 3.8 },
  { mes: 'May', facturado: 4.6, valor: 3.9 },
  { mes: 'Jun', facturado: 4.7, valor: 4.0 },
  { mes: 'Jul', facturado: 4.7, valor: 4.1 },
  { mes: 'Ago', facturado: 4.8, valor: 4.2 },
  { mes: 'Sep', facturado: 4.8, valor: 4.4 },
]
// ── Agenda de zonas comunes (forma de ZonaComunDTO / ReservaDTO del API_CONTRACT) ──
// `franjas` (zonas) y `residente`/`apartamento` (reservas) son extras que el backend aún no devuelve en ReservaDTO.

export const zonas = [
  { id: 1, nombre: 'Piscina', descripcion: 'Piscina de adultos y chapoteadero', capacidad: 40, activa: true, franjas: ['08:00-11:00', '11:00-14:00', '14:00-17:00', '17:00-20:00'] },
  { id: 2, nombre: 'Salón Social', descripcion: 'Cumpleaños, reuniones y celebraciones', capacidad: 60, activa: true, franjas: ['08:00-12:00', '14:00-18:00', '18:00-23:00'] },
  { id: 3, nombre: 'Zona BBQ', descripcion: 'Parrillas, mesas y zona verde', capacidad: 30, activa: true, franjas: ['12:00-16:00', '16:00-20:00', '18:00-22:00'] },
  { id: 4, nombre: 'Parque infantil', descripcion: 'Columpios y rodaderos para niños', capacidad: 20, activa: true, franjas: ['09:00-11:00', '11:00-13:00', '15:00-17:00', '16:00-18:00'] },
  { id: 5, nombre: 'Gimnasio', descripcion: 'Máquinas, pesas y cardio', capacidad: 10, activa: true, franjas: ['06:00-07:30', '06:00-08:00', '18:00-20:00', '20:00-22:00'] },
]

const vecinos = [
  { nombre: 'Juan Pérez', apartamentoId: 12, apartamento: 'Torre 2 · 304' },
  { nombre: 'Ana Gómez', apartamentoId: 4, apartamento: 'Torre 1 · 204' },
  { nombre: 'Carlos Rodríguez', apartamentoId: 25, apartamento: 'Torre 3 · 502' },
  { nombre: 'María Fernández', apartamentoId: 1, apartamento: 'Torre 1 · 101' },
  { nombre: 'Luis Ramírez', apartamentoId: 2, apartamento: 'Torre 1 · 102' },
  { nombre: 'Pedro Suárez', apartamentoId: 22, apartamento: 'Torre 3 · 410' },
  { nombre: 'Sofía Torres', apartamentoId: 9, apartamento: 'Torre 2 · 208' },
  { nombre: 'Camilo Ortiz', apartamentoId: 7, apartamento: 'Torre 2 · 111' },
]

// [día, zonaId, hora inicio, hora fin, vecino, estado]
const agenda = [
  ['2026-10-01', 5, 6, 8, 3, 'APROBADA'],
  ['2026-10-02', 2, 18, 22, 0, 'APROBADA'],
  ['2026-10-03', 1, 9, 12, 5, 'APROBADA'],
  ['2026-10-03', 3, 12, 16, 2, 'APROBADA'],
  ['2026-10-04', 1, 14, 17, 7, 'APROBADA'],
  ['2026-10-04', 4, 9, 11, 6, 'APROBADA'],
  ['2026-10-06', 5, 18, 20, 1, 'APROBADA'],
  ['2026-10-08', 3, 18, 22, 4, 'APROBADA'],
  ['2026-10-09', 2, 14, 18, 2, 'APROBADA'],
  ['2026-10-10', 1, 9, 12, 0, 'APROBADA'],
  ['2026-10-10', 3, 13, 17, 6, 'APROBADA'],
  ['2026-10-10', 4, 15, 17, 1, 'APROBADA'],
  ['2026-10-11', 2, 18, 23, 3, 'APROBADA'],
  ['2026-10-11', 1, 14, 17, 4, 'RECHAZADA'],
  ['2026-10-13', 5, 6, 8, 7, 'APROBADA'],
  ['2026-10-15', 4, 15, 17, 5, 'APROBADA'],
  ['2026-10-16', 2, 8, 12, 1, 'APROBADA'],
  ['2026-10-17', 1, 10, 13, 2, 'APROBADA'],
  ['2026-10-17', 3, 18, 22, 0, 'APROBADA'],
  ['2026-10-18', 2, 14, 18, 6, 'APROBADA'],
  ['2026-10-18', 1, 9, 12, 3, 'APROBADA'],
  ['2026-10-20', 5, 18, 20, 4, 'APROBADA'],
  ['2026-10-22', 3, 12, 16, 7, 'APROBADA'],
  ['2026-10-23', 2, 18, 22, 5, 'APROBADA'],
  ['2026-10-24', 1, 9, 12, 1, 'APROBADA'],
  ['2026-10-24', 3, 12, 16, 3, 'APROBADA'],
  ['2026-10-24', 4, 10, 12, 0, 'APROBADA'],
  ['2026-10-24', 2, 15, 19, 2, 'CANCELADA'],
  ['2026-10-25', 1, 14, 17, 6, 'APROBADA'],
  ['2026-10-25', 3, 18, 22, 4, 'APROBADA'],
  ['2026-10-26', 5, 6, 8, 0, 'APROBADA'],
  ['2026-10-27', 1, 10, 12, 3, 'APROBADA'],
  ['2026-10-27', 2, 14, 18, 0, 'PENDIENTE'],
  ['2026-10-27', 4, 15, 17, 7, 'APROBADA'],
  ['2026-10-27', 3, 16, 20, 5, 'APROBADA'],
  ['2026-10-27', 5, 18, 20, 2, 'APROBADA'],
  ['2026-10-28', 1, 13, 16, 4, 'PENDIENTE'],
  ['2026-10-28', 3, 18, 22, 1, 'APROBADA'],
  ['2026-10-29', 5, 6, 7.5, 5, 'APROBADA'],
  ['2026-10-29', 2, 9, 12, 6, 'APROBADA'],
  ['2026-10-30', 3, 18, 22, 2, 'PENDIENTE'],
  ['2026-10-30', 4, 16, 18, 3, 'APROBADA'],
  ['2026-10-31', 4, 9, 11, 1, 'APROBADA'],
  ['2026-10-31', 1, 10, 13, 0, 'APROBADA'],
  ['2026-10-31', 3, 12, 16, 4, 'APROBADA'],
  ['2026-10-31', 2, 15, 22, 7, 'APROBADA'],
  ['2026-11-01', 1, 9, 12, 5, 'APROBADA'],
  ['2026-11-01', 3, 13, 17, 6, 'PENDIENTE'],
  ['2026-11-03', 5, 18, 20, 3, 'APROBADA'],
  ['2026-11-05', 2, 18, 22, 1, 'PENDIENTE'],
  ['2026-11-07', 1, 10, 13, 2, 'APROBADA'],
  ['2026-11-07', 3, 12, 16, 0, 'APROBADA'],
  ['2026-11-08', 2, 14, 18, 4, 'APROBADA'],
  ['2026-11-14', 4, 9, 11, 6, 'APROBADA'],
  ['2026-11-15', 3, 18, 22, 7, 'PENDIENTE'],
  ['2026-11-21', 2, 16, 22, 5, 'APROBADA'],
]

const hora = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}:00`

export const reservasAgenda = agenda.map(([dia, zonaId, ini, fin, v, estado], i) => ({
  id: 200 + i,
  zonaComunId: zonaId,
  zonaComunNombre: zonas.find((z) => z.id === zonaId).nombre,
  apartamentoId: vecinos[v].apartamentoId,
  fechaInicio: `${dia}T${hora(ini)}`,
  fechaFin: `${dia}T${hora(fin)}`,
  estado,
  residente: vecinos[v].nombre,
  apartamento: vecinos[v].apartamento,
}))
