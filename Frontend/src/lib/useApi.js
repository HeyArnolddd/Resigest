import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// Carga un recurso GET y expone { datos, cargando, error, recargar }.
// Mientras no hay respuesta devuelve `inicial`, así las pantallas no necesitan comprobar null.
export function useApi(ruta, params, inicial = null) {
  const [estado, setEstado] = useState({ datos: inicial, cargando: Boolean(ruta), error: null })
  const clave = JSON.stringify([ruta, params])

  const cargar = useCallback(async () => {
    if (!ruta) return
    setEstado((e) => ({ ...e, cargando: true, error: null }))
    try {
      const datos = await api.get(ruta, params)
      setEstado({ datos, cargando: false, error: null })
    } catch (error) {
      setEstado((e) => ({ ...e, cargando: false, error }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { ...estado, recargar: cargar }
}
