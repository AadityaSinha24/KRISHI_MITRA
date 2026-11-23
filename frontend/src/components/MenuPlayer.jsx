// Shows the menu one item at a time and can read it aloud.
//   items        [{ key, label }] from the backend
//   index        which item is showing
//   speaking     true while the menu (or one item) is being read
export default function MenuPlayer({
  items,
  index,
  loading,
  error,
  speaking,
  speechSupported,
  onListen,
  onStop,
  onStep,
  onRetry,
}) {
  const current = items[index]

  return (
    <section
      aria-label="मेनू"
      className="rounded-2xl bg-leaf-800 p-4 text-white shadow-sm"
    >
      <button
        type="button"
        onClick={speaking ? onStop : onListen}
        disabled={!items.length || !speechSupported}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-wheat-400 text-lg
          font-semibold text-leaf-900 hover:bg-wheat-500 disabled:cursor-not-allowed disabled:opacity-50
          focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span aria-hidden="true">{speaking ? '⏹' : '🔊'}</span>
        {speaking ? 'रुकें' : 'मेनू सुनें'}
      </button>

      <div className="mt-4 min-h-24" aria-live="polite">
        {loading ? (
          <p className="py-6 text-center text-base text-leaf-100">मेनू लोड हो रहा है…</p>
        ) : error ? (
          <div className="py-2 text-center">
            <p role="alert" className="text-base text-wheat-200">
              {error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border-2 border-white/60 px-4 py-2 text-base font-medium
                hover:bg-white/10 focus-visible:outline-4 focus-visible:outline-wheat-400"
            >
              दोबारा कोशिश करें
            </button>
          </div>
        ) : current ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="पिछला विकल्प"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-2xl
                hover:bg-white/20 focus-visible:outline-4 focus-visible:outline-wheat-400"
            >
              ‹
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-lg bg-white text-2xl
                  font-bold text-leaf-800"
                aria-hidden="true"
              >
                {current.key}
              </span>
              <p className="text-lg font-medium leading-snug">
                <span className="sr-only">विकल्प {current.key}: </span>
                {current.label}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="अगला विकल्प"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-2xl
                hover:bg-white/20 focus-visible:outline-4 focus-visible:outline-wheat-400"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {current ? (
        <p className="mt-1 text-center text-sm text-leaf-100">
          {index + 1} / {items.length}
        </p>
      ) : null}
    </section>
  )
}
