import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { EVENTO_SESION_EXPIRADA, api, borrarToken, guardarToken, leerToken } from './api'

const SesionContext = createContext(null)

// Mantiene al usuario autenticado. Al recargar la página recupera la sesión con el token guardado.
export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Solo hay que restaurar si quedó un token guardado de una visita anterior.
  const [restaurando, setRestaurando] = useState(() => Boolean(leerToken()))
  const [aviso, setAviso] = useState('')

  const cerrarSesion = useCallback((mensaje = '') => {
    borrarToken()
    setUsuario(null)
    setAviso(mensaje)
  }, [])

  useEffect(() => {
    if (!restaurando) return
    api('/usuarios/me')
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setRestaurando(false))
  }, [restaurando])

  useEffect(() => {
    const alExpirar = () => cerrarSesion('Tu sesión terminó. Vuelve a ingresar para continuar.')
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async (correo, contrasena, recordar) => {
    const { token } = await api('/auth/login', { method: 'POST', body: { correo: correo.trim(), contrasena } })
    guardarToken(token, recordar)
    try {
      const perfil = await api('/usuarios/me')
      setAviso('')
      setUsuario(perfil)
      return perfil
    } catch (e) {
      borrarToken()
      throw e
    }
  }, [])

  const valor = useMemo(
    () => ({ usuario, restaurando, aviso, iniciarSesion, cerrarSesion }),
    [usuario, restaurando, aviso, iniciarSesion, cerrarSesion],
  )

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

SesionProvider.propTypes = { children: PropTypes.node }

// oxlint-disable-next-line react/only-export-components
export function useSesion() {
  return useContext(SesionContext)
}
