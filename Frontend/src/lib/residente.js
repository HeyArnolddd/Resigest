import { api } from './api'
import { aPaquete } from './porteria'

// Llamadas del portal del residente. Casi todas dependen de su apartamento (usuario.apartamentoId).
export const residenteApi = {
  paquetes: (apartamentoId) => api('/paquetes', { params: { apartamentoId } }).then((l) => l.map(aPaquete)),
  confirmarRecogido: (id) => api(`/paquetes/${id}/recogido`, { method: 'PATCH' }).then(aPaquete),
  estadoCuenta: (apartamentoId) => api(`/apartamentos/${apartamentoId}/estado-cuenta`),
  obligaciones: (apartamentoId) => api('/obligaciones', { params: { apartamentoId } }),
  pagos: (apartamentoId) => api('/pagos', { params: { apartamentoId } }),
  pagarEnLinea: (obligacionId) => api('/pagos/pasarela', { method: 'POST', body: { obligacionId } }),
  reportarTransferencia: (obligacionId, comprobante, referencia) =>
    api('/pagos/manual', { method: 'POST', body: { obligacionId, urlComprobanteAdjunto: comprobante, referencia } }),
  zonas: () => api('/zonas-comunes'),
  reservas: (params) => api('/reservas', { params }),
  solicitarReserva: (datos) => api('/reservas', { method: 'POST', body: datos }),
  cancelarReserva: (id) => api(`/reservas/${id}`, { method: 'DELETE' }),
  comunicados: () => api('/comunicados'),
  directorio: () => api('/usuarios/directorio'),
  conversaciones: () => api('/chat/conversaciones'),
  // Chats comunitarios: torreId null = general del conjunto
  canalesComunidad: () => api('/chat/comunidad/canales'),
  comunidad: (torreId) => api('/chat/comunidad', { params: { torreId } }),
  enviarComunidad: (contenido, torreId) => api('/chat/comunidad', { method: 'POST', body: { contenido, torreId } }),
  eventos: () => api('/eventos'),
  mensajes: (conUsuarioId) => api('/chat', { params: { conUsuarioId } }),
  enviarMensaje: (destinatarioId, contenido) => api('/chat', { method: 'POST', body: { destinatarioId, contenido } }),
}

export const fmtFechaCorta = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
export const fmtFechaLarga = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
