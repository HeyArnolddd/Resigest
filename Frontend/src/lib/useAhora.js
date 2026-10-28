import { useEffect, useState } from 'react'

// Hora actual que se refresca cada minuto y al volver a la pestaña, para que lo que
// depende de la hora (saludo, día/noche) cambie sin recargar la página.
export function useAhora(intervalo = 60000) {
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const actualizar = () => setAhora(new Date())
    const id = setInterval(actualizar, intervalo)
    const alVolver = () => document.visibilityState === 'visible' && actualizar()
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('focus', actualizar)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener('focus', actualizar)
    }
  }, [intervalo])

  return ahora
}
