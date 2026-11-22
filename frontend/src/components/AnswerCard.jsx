import { useEffect, useRef } from 'react'
import Loader from './Loader'

// Shows the answer for the chosen number, with a button to hear it again.
//   answer = { status: 'idle' | 'loading' | 'done' | 'error', key, label, text, error }
export default function AnswerCard({ answer, speaking, speechSupported, onSpeak, onStop }) {
  const ref = useRef(null)

  // Bring the answer into view when it starts loading and when it arrives.
  useEffect(() => {
    if (answer.status === 'loading' || answer.status === 'done') {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [answer.status])

  if (answer.status === 'idle') return null

  return (
    <section
      ref={ref}
      aria-live="polite"
      className="rounded-2xl border-l-8 border-wheat-400 bg-white p-4 shadow-sm ring-1 ring-leaf-100"
    >
      <p className="text-base font-semibold text-leaf-700">
        नंबर {answer.key}
        {answer.label ? ` · ${answer.label}` : ''}
      </p>

      {answer.status === 'loading' ? (
        <p className="mt-3 text-lg text-leaf-800">
          <Loader label="जवाब आ रहा है…" />
        </p>
      ) : null}

      {answer.status === 'error' ? (
        <p role="alert" className="mt-3 text-lg font-medium text-red-700">
          {answer.error} दोबारा ✓ दबाएं।
        </p>
      ) : null}

      {answer.status === 'done' ? (
        <>
          <p className="mt-3 text-xl leading-relaxed text-soil">{answer.text}</p>
          {speechSupported ? (
            <button
              type="button"
              onClick={speaking ? onStop : onSpeak}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-leaf-700 text-lg
                font-semibold text-white hover:bg-leaf-600 focus-visible:outline-4
                focus-visible:outline-offset-2 focus-visible:outline-wheat-400"
            >
              <span aria-hidden="true">{speaking ? '⏹' : '🔊'}</span>
              {speaking ? 'रुकें' : 'फिर से सुनें'}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
