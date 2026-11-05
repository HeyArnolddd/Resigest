import PropTypes from 'prop-types'
import { Select } from '../ui'

// Lista de apartamentos agrupada por torre. `apartamentos` son ApartamentoDTO del API (null mientras cargan).
export default function SelectApartamento({ id, apartamentos, value, onChange, invalido }) {
  const torres = Object.entries(
    (apartamentos ?? []).reduce((acc, a) => ({ ...acc, [a.torreNombre]: [...(acc[a.torreNombre] ?? []), a] }), {}),
  )
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={!apartamentos} aria-invalid={invalido}>
      <option value="">{apartamentos ? 'Elige un apartamento' : 'Cargando apartamentos…'}</option>
      {torres.map(([torre, aptos]) => (
        <optgroup key={torre} label={`Torre ${torre}`}>
          {aptos.map((a) => (
            <option key={a.id} value={a.id}>
              Torre {torre} · Apto {a.numero}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  )
}

SelectApartamento.propTypes = {
  id: PropTypes.string,
  apartamentos: PropTypes.array,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  invalido: PropTypes.bool,
}
