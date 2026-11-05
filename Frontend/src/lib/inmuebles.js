import { useApi } from './useApi'

// Apartamentos del conjunto para resolver "torre + número" al id que pide el API.
export function useApartamentos() {
  const { datos } = useApi('/api/apartamentos', undefined, [])
  const torres = [...new Set(datos.map((a) => a.torreNombre))].sort()
  const buscar = (torre, numero) => datos.find((a) => a.torreNombre === torre && a.numero === String(numero).trim())
  return { apartamentos: datos, torres, buscar }
}
