import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { FileText, ImagePlus, Loader2, RefreshCw, X } from 'lucide-react'
import { urlLocal } from '../../lib/api'
import { cn } from '../../lib/utils'

const MAX_BYTES = 5 * 1024 * 1024
const TIPOS = { imagen: 'image/jpeg,image/png,image/webp', imagenOPdf: 'image/jpeg,image/png,image/webp,application/pdf' }

const tamano = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`)

// Elegir una foto o un PDF desde el equipo o la cámara del celular. Valida tipo y tamaño (máx. 5 MB)
// y muestra la vista previa. `value` es el File elegido (o null).
export function CampoArchivo({ id, value, onChange, tipo = 'imagen', texto = 'Toca para elegir una foto', invalido }) {
  const entrada = useRef(null)
  const [error, setError] = useState('')
  // Vista previa local de la imagen elegida; se libera al cambiarla
  const vista = useMemo(() => (value?.type.startsWith('image/') ? URL.createObjectURL(value) : null), [value])
  useEffect(() => () => vista && URL.revokeObjectURL(vista), [vista])

  const elegir = (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    if (!TIPOS[tipo].split(',').includes(archivo.type)) {
      setError(tipo === 'imagen' ? 'Elige una imagen JPG, PNG o WEBP.' : 'Elige una imagen (JPG, PNG o WEBP) o un PDF.')
      return
    }
    if (archivo.size > MAX_BYTES) {
      setError(`El archivo pesa ${tamano(archivo.size)}. El máximo es 5 MB.`)
      return
    }
    setError('')
    onChange(archivo)
  }

  return (
    <div>
      <input ref={entrada} id={id} type="file" accept={TIPOS[tipo]} onChange={elegir} className="sr-only" />
      {value ? (
        <div className={cn('flex items-center gap-3 rounded-lg border bg-white p-2.5', invalido ? 'border-danger' : 'border-slate-300')}>
          {vista ? (
            <img src={vista} alt="Vista previa" className="size-16 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <FileText className="size-7" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{value.name}</p>
            <p className="text-xs text-slate-500">{tamano(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            aria-label="Cambiar archivo"
            title="Cambiar"
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <RefreshCw className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar archivo"
            title="Quitar"
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 outline-none hover:bg-danger-bg hover:text-danger-strong focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            'flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed bg-slate-50 px-4 py-5 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40 focus-within:ring-2 focus-within:ring-brand-500',
            invalido ? 'border-danger' : 'border-slate-300',
          )}
        >
          <ImagePlus className="size-6 text-brand-600" />
          <span className="text-xs font-semibold text-slate-600">{texto}</span>
          <span className="text-[11px] text-slate-400">{tipo === 'imagen' ? 'JPG, PNG o WEBP' : 'Foto (JPG, PNG) o PDF'} · máx. 5 MB</span>
        </label>
      )}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-danger-strong" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

CampoArchivo.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  tipo: PropTypes.oneOf(['imagen', 'imagenOPdf']),
  texto: PropTypes.string,
  invalido: PropTypes.bool,
}

// Muestra un archivo subido al backend (las rutas /api/archivos/* exigen el token).
// Las imágenes se ven en miniatura y se abren en grande al tocarlas; los PDF muestran un botón.
export function ArchivoProtegido({ url, alt, className }) {
  const [archivo, setArchivo] = useState(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    let vigente = true
    let creada
    urlLocal(url)
      .then((a) => {
        creada = a.url
        if (vigente) setArchivo(a)
      })
      .catch(() => vigente && setFallo(true))
    return () => {
      vigente = false
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [url])

  if (fallo) {
    return <span className={cn('flex items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-[11px] text-slate-500', className)}>No se pudo cargar</span>
  }
  if (!archivo) {
    return (
      <span className={cn('flex items-center justify-center rounded-lg bg-slate-100', className)} role="status" aria-label="Cargando archivo">
        <Loader2 className="size-5 animate-spin text-slate-400" />
      </span>
    )
  }
  const esImagen = archivo.tipo.startsWith('image/')
  return (
    <a
      href={archivo.url}
      target="_blank"
      rel="noopener noreferrer"
      title={esImagen ? 'Ver en grande' : 'Abrir PDF'}
      className={cn('group block overflow-hidden rounded-lg outline-none ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-brand-500', className)}
    >
      {esImagen ? (
        <img src={archivo.url} alt={alt} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1 bg-slate-50 text-slate-600">
          <FileText className="size-7 text-danger" />
          <span className="text-[11px] font-semibold">Abrir PDF</span>
        </span>
      )}
    </a>
  )
}

ArchivoProtegido.propTypes = { url: PropTypes.string.isRequired, alt: PropTypes.string.isRequired, className: PropTypes.string }
