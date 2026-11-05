import { useCallback, useEffect, useState } from 'react'

// Datos ya cargados por clave, para mostrarlos al instante al volver a una pantalla
// mientras se piden de nuevo (la BD está lejos y cada consulta tarda). Se vacía al cerrar sesión.
const cache = new Map()

export function limpiarCache() {
  cache.clear()
}

export const leerCache = (clave) => cache.get(clave)
export const guardarCache = (clave, valor) => cache.set(clave, valor)

// Carga datos del API. `datos` queda en null mientras carga la primera vez; `recargar` vuelve a pedirlos.
// Con `clave`, la respuesta se guarda y la próxima vez se muestra de inmediato y se actualiza por detrás.
export function useCarga(cargar, clave) {
  const [datos, setDatos] = useState(() => (clave ? (cache.get(clave) ?? null) : null))
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    cargar()
      .then((d) => {
        if (!vigente) return
        if (clave) cache.set(clave, d)
        setDatos(d)
        setError('')
      })
      .catch((e) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
    // `cargar` se define en cada render; la carga solo se repite al pedir recargar o cambiar de clave
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [version, clave])

  const recargar = useCallback(() => {
    setError('')
    setVersion((v) => v + 1)
  }, [])

  return { datos, error, recargar }
}
