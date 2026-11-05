import { DoorOpen, Home, ShieldCheck, Wrench } from 'lucide-react'
import { api } from './api'

// Roles que puede crear el administrador, en el orden en que aparecen en pantalla.
// `personal`: el administrador puede consultar su contraseña después de crearla.
export const ROLES_USUARIO = [
  { rol: 'RESIDENTE', etiqueta: 'Residente', plural: 'Residentes', icono: Home, tinte: 'bg-brand-50 text-brand-700', anillo: 'ring-brand-500' },
  { rol: 'PORTERO', etiqueta: 'Portería', plural: 'Portería', icono: DoorOpen, tinte: 'bg-sky-50 text-sky-700', anillo: 'ring-sky-500', personal: true },
  { rol: 'MANTENIMIENTO', etiqueta: 'Mantenimiento', plural: 'Mantenimiento', icono: Wrench, tinte: 'bg-amber-50 text-amber-700', anillo: 'ring-amber-500', personal: true },
  { rol: 'ADMINISTRADOR', etiqueta: 'Administrador', plural: 'Administradores', icono: ShieldCheck, tinte: 'bg-violet-50 text-violet-700', anillo: 'ring-violet-500' },
]

export const infoRol = (rol) => ROLES_USUARIO.find((r) => r.rol === rol)

export const esPersonal = (rol) => Boolean(infoRol(rol)?.personal)

export const ESPECIALIDADES = ['Plomería', 'Electricidad', 'Jardinería', 'Carpintería', 'Cerrajería', 'Pintura', 'Mantenimiento general']

// Lo que identifica a cada usuario además de su nombre: apartamento, turno o especialidad.
export function detalleRol(u) {
  if (u.rol === 'RESIDENTE') return u.apartamento
  if (u.rol === 'PORTERO') return u.turno && `Turno ${u.turno.toLowerCase()}`
  if (u.rol === 'MANTENIMIENTO') return u.especialidad
  return null
}

// Contraseña de 10 caracteres, fácil de dictar: sin 0/O, 1/l/I. Siempre tiene mayúscula, minúscula y número.
export function generarContrasena() {
  const grupos = ['ABCDEFGHJKMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789']
  const todos = grupos.join('')
  const azar = (n) => crypto.getRandomValues(new Uint32Array(1))[0] % n
  const letras = grupos.map((g) => g[azar(g.length)])
  while (letras.length < 10) letras.push(todos[azar(todos.length)])
  for (let i = letras.length - 1; i > 0; i--) {
    const j = azar(i + 1)
    ;[letras[i], letras[j]] = [letras[j], letras[i]]
  }
  return letras.join('')
}

export const usuariosApi = {
  listar: ({ rol, q, activo, page, size = 10 }) =>
    api('/usuarios', { params: { rol, q, activo, page, size, sort: 'nombreCompleto,asc' } }),
  contar: (rol) => api('/usuarios', { params: { rol, size: 1 } }).then((p) => p.totalElements),
  crear: (datos) => api('/usuarios', { method: 'POST', body: datos }),
  actualizar: (id, datos) => api(`/usuarios/${id}`, { method: 'PUT', body: datos }),
  activar: (id) => api(`/usuarios/${id}/activar`, { method: 'PATCH' }),
  desactivar: (id) => api(`/usuarios/${id}/desactivar`, { method: 'PATCH' }),
  eliminar: (id) => api(`/usuarios/${id}`, { method: 'DELETE' }),
  cambiarContrasena: (id, contrasena) => api(`/usuarios/${id}/contrasena`, { method: 'PATCH', body: { contrasena } }),
  credenciales: (id) => api(`/usuarios/${id}/credenciales`),
  apartamentos: () => api('/apartamentos'),
}
