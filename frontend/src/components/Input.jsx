// Labelled text field that works with react-hook-form's register():
//   <Input label="..." error={errors.x?.message} {...register('x', rules)} />
// (React 19 passes `ref` as a normal prop, so no forwardRef is needed.)
export default function Input({ label, error, hint, id, ref, ...props }) {
  const inputId = id || props.name
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-base font-medium text-leaf-900">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`block h-12 w-full rounded-lg border-2 bg-white px-3 text-lg text-soil
          placeholder:text-soil/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-wheat-200
          ${error ? 'border-red-600' : 'border-leaf-300 focus:border-leaf-600'}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-sm text-soil/70">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
