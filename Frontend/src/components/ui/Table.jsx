import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

const columnType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  header: PropTypes.node,
  align: PropTypes.oneOf(['left', 'right']),
  render: PropTypes.func,
})

const celda = (col, row) => (col.render ? col.render(row) : row[col.key])

export default function Table({ columns, data, rowKey = 'id', emptyText = 'Sin registros' }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
        <span className="text-sm font-medium text-slate-600">{emptyText}</span>
        <span className="text-xs text-slate-400">No hay información para mostrar.</span>
      </div>
    )
  }

  // En móvil cada fila es una tarjeta: la primera columna hace de título, las columnas sin
  // encabezado (acciones) van al pie y el resto se lista como etiqueta: valor.
  const [titulo, ...resto] = columns
  const datos = resto.filter((c) => c.header)
  const acciones = resto.filter((c) => !c.header)

  return (
    <>
      <ul className="divide-y divide-slate-100 sm:hidden">
        {data.map((row, i) => (
          <li key={row[rowKey] ?? i} className="px-4 py-3.5">
            <div className="text-sm font-semibold text-slate-800">{celda(titulo, row)}</div>
            {datos.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                {datos.map((col) => (
                  <div key={col.key} className="min-w-0">
                    <dt className="text-[11px] font-medium text-slate-400">{col.header}</dt>
                    <dd className="mt-0.5 break-words text-sm text-slate-700">{celda(col, row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {acciones.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {acciones.map((col) => (
                  <div key={col.key}>{celda(col, row)}</div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-medium text-slate-600 first:pl-5 last:pr-5',
                    col.align === 'right' && 'text-right',
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row[rowKey] ?? i}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-slate-700 first:pl-5 last:pr-5',
                      col.align === 'right' && 'text-right',
                    )}
                  >
                    {celda(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

Table.propTypes = {
  columns: PropTypes.arrayOf(columnType).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowKey: PropTypes.string,
  emptyText: PropTypes.string,
}
