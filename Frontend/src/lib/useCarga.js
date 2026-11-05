import { useCallback, useEffect, useState } from 'react'

// Carga varias consultas a la vez. `datos` queda en null mientras carga; `recargar` vuelve a pedirlas.
export function useCarga(cargar) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    cargar()
      .then((d) => {
        if (!vigente) return
        setDatos(d)
        setError('')
      })
      .catch((e) => vigente && setError(e.message))
    return () => {
      vigente = false
    }
    // `cargar` se define en cada render; la carga solo se repite al pedir recargar
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  const recargar = useCallback(() => {
    setError('')
    setVersion((v) => v + 1)
  }, [])

  return { datos, error, recargar }
}
