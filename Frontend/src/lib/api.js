// Cliente HTTP del API de ResiGest. En desarrollo Vite redirige /api a localhost:8080.
const BASE = import.meta.env.VITE_API_URL ?? ''
const CLAVE_TOKEN = 'resigest.token'

export class ApiError extends Error {
  constructor(estado, cuerpo) {
    super(cuerpo?.mensaje ?? 'No se pudo completar la operación')
    this.estado = estado
    this.codigo = cuerpo?.codigo
    this.erroresCampo = cuerpo?.erroresCampo ?? {}
  }
}

export const token = {
  leer() {
    try {
      return sessionStorage.getItem(CLAVE_TOKEN)
    } catch {
      return null
    }
  },
  guardar(valor) {
    try {
      sessionStorage.setItem(CLAVE_TOKEN, valor)
    } catch {
      /* sin almacenamiento: la sesión dura solo mientras la pestaña esté abierta */
    }
  },
  borrar() {
    try {
      sessionStorage.removeItem(CLAVE_TOKEN)
    } catch {
      /* nada que borrar */
    }
  },
}

// Se invoca cuando el API responde 401 con una sesión abierta (token vencido o inválido).
let alExpirar = () => {}
export const configurarExpiracion = (fn) => {
  alExpirar = fn
}

function construirUrl(ruta, params) {
  const url = new URL(BASE + ruta, window.location.origin)
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  return url.pathname + url.search
}

async function pedir(metodo, ruta, { params, cuerpo, formData } = {}) {
  const cabeceras = {}
  const jwt = token.leer()
  if (jwt) cabeceras.Authorization = `Bearer ${jwt}`
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'

  let respuesta
  try {
    respuesta = await fetch(construirUrl(ruta, params), {
      method: metodo,
      headers: cabeceras,
      body: formData ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
    })
  } catch {
    throw new ApiError(0, { mensaje: 'No hay conexión con el servidor. Intenta de nuevo.' })
  }

  if (respuesta.status === 204) return null
  const tipo = respuesta.headers.get('content-type') ?? ''
  const datos = tipo.includes('json') ? await respuesta.json() : await respuesta.blob()

  if (!respuesta.ok) {
    if (respuesta.status === 401 && jwt) alExpirar()
    throw new ApiError(respuesta.status, datos)
  }
  return datos
}

export const api = {
  get: (ruta, params) => pedir('GET', ruta, { params }),
  post: (ruta, cuerpo) => pedir('POST', ruta, { cuerpo }),
  patch: (ruta, cuerpo) => pedir('PATCH', ruta, { cuerpo }),
  del: (ruta) => pedir('DELETE', ruta),
  subir: (ruta, formData) => pedir('POST', ruta, { formData }),
}
