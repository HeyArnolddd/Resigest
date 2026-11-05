// Cliente HTTP del API. Agrega el token, traduce los errores al formato del contrato
// ({ codigo, mensaje, erroresCampo }) y avisa cuando la sesión deja de ser válida.

const CLAVE_TOKEN = 'resigest.token'

export function leerToken() {
  return localStorage.getItem(CLAVE_TOKEN) ?? sessionStorage.getItem(CLAVE_TOKEN)
}

// Con "Recordarme" el token sobrevive al cerrar el navegador; si no, solo dura la pestaña.
export function guardarToken(token, recordar) {
  borrarToken()
  ;(recordar ? localStorage : sessionStorage).setItem(CLAVE_TOKEN, token)
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN)
  sessionStorage.removeItem(CLAVE_TOKEN)
}

export class ApiError extends Error {
  constructor({ status, codigo, mensaje, erroresCampo }) {
    super(mensaje)
    this.status = status
    this.codigo = codigo
    this.erroresCampo = erroresCampo ?? {}
  }
}

// La sesión escucha este evento para volver al login cuando el token vence o la cuenta se desactiva.
export const EVENTO_SESION_EXPIRADA = 'resigest:sesion-expirada'

const MENSAJES = {
  0: 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
  403: 'No tienes permiso para hacer esto.',
  500: 'Algo falló en el servidor. Intenta de nuevo en unos minutos.',
}

// En desarrollo el API va por el proxy de Vite (mismo origen). En producción, VITE_API_URL
// apunta al backend desplegado, p. ej. https://resigest-api.onrender.com
const BASE_API = import.meta.env.VITE_API_URL || window.location.origin

export async function api(ruta, { method = 'GET', body, params } = {}) {
  const url = new URL(`/api${ruta}`, BASE_API)
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })

  const token = leerToken()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError({ status: 0, codigo: 'SIN_CONEXION', mensaje: MENSAJES[0] })
  }

  if (respuesta.ok) {
    return respuesta.status === 204 ? null : respuesta.json().catch(() => null)
  }

  const datos = await respuesta.json().catch(() => ({}))
  // Spring Security responde 401/403 sin cuerpo cuando el token ya no sirve.
  if (token && (respuesta.status === 401 || (respuesta.status === 403 && !datos.codigo))) {
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
  }
  throw new ApiError({
    status: respuesta.status,
    codigo: datos.codigo,
    mensaje: datos.mensaje ?? MENSAJES[respuesta.status] ?? MENSAJES[500],
    erroresCampo: datos.erroresCampo,
  })
}
