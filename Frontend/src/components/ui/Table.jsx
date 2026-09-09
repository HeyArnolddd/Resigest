import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

const columnType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  header: PropTypes.node,
  align: PropTypes.oneOf(['left', 'right']),
  render: PropTypes.func,
})

export default function Table({ columns, data, rowKey = 'id', emptyText = 'Sin registros' }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
        <span className="text-sm font-medium text-slate-600">{emptyText}</span>
        <span className="text-xs text-slate-400">No hay información para mostrar.</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
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
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Table.propTypes = {
  columns: PropTypes.arrayOf(columnType).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowKey: PropTypes.string,
  emptyText: PropTypes.string,
}