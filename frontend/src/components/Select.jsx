
export default function Select({ label, error, hint, id, ref, options = [], ...props }) {
  const selectId = id || props.name
  const describedBy = error
    ? `${selectId}-error`
    : hint
      ? `${selectId}-hint`
      : undefined

  return (
    <div>
      <label htmlFor={selectId} className="field-label">
        {label}
      </label>

      <select
        id={selectId}
        ref={ref}
        className="field-input"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...props}
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={`${selectId}-error`} role="alert" className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
