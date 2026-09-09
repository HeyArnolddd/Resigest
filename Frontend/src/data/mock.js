export const residente = {
  nombre: 'Juan Pérez',
  torre: 'Torre 2',
  apto: '304',
  email: 'juan.perez@correo.co',
  celular: '+57 300 123 4567',
}

export const obligaciones = [
  { id: 'OB-118', concepto: 'Cuota de administración', periodo: 'Sep 2026', valor: 160000, vencimiento: '10/09/2026', estado: 'Pendiente' },
  { id: 'OB-117', concepto: 'Cuota de administración', periodo: 'Ago 2026', valor: 160000, vencimiento: '10/08/2026', estado: 'Pendiente' },
  { id: 'OB-116', concepto: 'Cuota de administración', periodo: 'Jul 2026', valor: 160000, vencimiento: '10/07/2026', estado: 'Pagada' },
  { id: 'OB-115', concepto: 'Cuota de administración', periodo: 'Jun 2026', valor: 160000, vencimiento: '10/06/2026', estado: 'Pagada' },
  { id: 'OB-114', concepto: 'Fondo de reserva · semestre I', periodo: 'May 2026', valor: 80000, vencimiento: '15/05/2026', estado: 'Pagada' },
  { id: 'OB-113', concepto: 'Cuota de administración', periodo: 'Abr 2026', valor: 160000, vencimiento: '10/04/2026', estado: 'Pagada' },
]

export const saldoPendiente = 320000

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

export const ingresos = [
  { id: 1, hora: '10:24', persona: 'Laura Martínez', apartamento: 'T2 · 305', tipo: 'Visitante', estado: 'En portería' },
  { id: 2, hora: '09:58', persona: 'Repartidor Rappi', apartamento: 'T3 · 501', tipo: 'Domicilio', estado: 'Completado' },
  { id: 3, hora: '09:31', persona: 'Pedro Sánchez', apartamento: 'T1 · 103', tipo: 'Visitante', estado: 'Completado' },
  { id: 4, hora: '09:12', persona: 'Repartidor Uber Eats', apartamento: 'T2 · 208', tipo: 'Domicilio', estado: 'Completado' },
  { id: 5, hora: '08:47', persona: 'Técnico de TV', apartamento: 'T3 · 410', tipo: 'Servicio', estado: 'Completado' },
  { id: 6, hora: '08:02', persona: 'Valentina López', apartamento: 'T1 · 201', tipo: 'Visitante', estado: 'Completado' },
]

export const paquetesPorteria = [
  { id: 'PAQ-231', empresa: 'Rappi', guia: 'RP-4829137', apartamento: 'T2 · 304', fecha: '09/09/2026 · 10:04', estado: 'Ha llegado' },
  { id: 'PAQ-230', empresa: 'Domicilios.com', guia: 'DC-5587721', apartamento: 'T1 · 102', fecha: '09/09/2026 · 09:22', estado: 'Entregado' },
  { id: 'PAQ-229', empresa: 'Mercado Libre', guia: 'ML-8839201', apartamento: 'T3 · 501', fecha: '08/09/2026 · 16:45', estado: 'Entregado' },
  { id: 'PAQ-227', empresa: 'Mercado Libre', guia: 'ML-9912374', apartamento: 'T2 · 304', fecha: '08/09/2026 · 11:03', estado: 'Ha llegado' },
  { id: 'PAQ-226', empresa: 'Amazon', guia: 'AMZ-7738291', apartamento: 'T1 · 205', fecha: '07/09/2026 · 15:18', estado: 'Entregado' },
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

export const recaudoMensual = [
  { mes: 'Abr', valor: 3.8 },
  { mes: 'May', valor: 3.9 },
  { mes: 'Jun', valor: 4.0 },
  { mes: 'Jul', valor: 4.1 },
  { mes: 'Ago', valor: 4.2 },
  { mes: 'Sep', valor: 4.4 },
]