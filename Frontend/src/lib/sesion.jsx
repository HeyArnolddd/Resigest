import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { api, configurarExpiracion, token } from './api'

// Rol del API → clave de rol del frontend (config/roles.js). Único lugar donde se traduce.
const ROL_A_CLAVE = {
  RESIDENTE: 'residente',
  PORTERO: 'porteria',
  MANTENIMIENTO: 'mantenimiento',
  ADMINISTRADOR: 'administrador',
}

const SesionContext = createContext(null)

function aSesion(perfil) {
  return {
    roleKey: ROL_A_CLAVE[perfil.rol],
    usuario: perfil.nombreCompleto,
    detalle: perfil.residente?.apartamento ?? null,
    perfil,
  }
}

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [iniciando, setIniciando] = useState(Boolean(token.leer()))

  const cerrar = useCallback(() => {
    token.borrar()
    setSesion(null)
  }, [])

  useEffect(() => {
    configurarExpiracion(cerrar)
  }, [cerrar])

  // Restaura la sesión si la pestaña ya tenía un token.
  useEffect(() => {
    if (!token.leer()) return
    api
      .get('/api/usuarios/me')
      .then((perfil) => setSesion(aSesion(perfil)))
      .catch(() => token.borrar())
      .finally(() => setIniciando(false))
  }, [])

  const ingresar = useCallback(async (correo, contrasena) => {
    const { token: jwt } = await api.post('/api/auth/login', { correo, contrasena })
    token.guardar(jwt)
    const perfil = await api.get('/api/usuarios/me')
    setSesion(aSesion(perfil))
  }, [])

  const valor = useMemo(() => ({ sesion, iniciando, ingresar, cerrar }), [sesion, iniciando, ingresar, cerrar])
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

SesionProvider.propTypes = { children: PropTypes.node.isRequired }

// eslint-disable-next-line react-refresh/only-export-components
export const useSesion = () => useContext(SesionContext)
