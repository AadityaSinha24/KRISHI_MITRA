import Loader from './Loader'

// Shows whichever of your three Dashboard states is active: loading, error or answer.
// (Priority: loading, then error, then answer.) Nothing is drawn when all three are empty.
export default function ResponseCard({ loading, error, answer, speaking, onSpeak, onStop }) {
  const status = loading ? 'loading' : error ? 'error' : answer ? 'done' : 'idle'
  if (status === 'idle') return null

  const icon = status === 'loading' ? '⏳' : status === 'error' ? '⚠️' : '📋'

  return (
    // key={status} restarts the slide-up animation whenever the card changes kind
    <section key={status} className="response-area" id="response-area" aria-live="polite">
      <div className="response-card" id="response-card">
        <div className="response-icon" id="response-icon">
          {icon}
        </div>

        <div className="response-text" id="response-text">
          {status === 'loading' ? (
            <Loader label="जवाब आ रहा है..." />
          ) : status === 'error' ? (
            error
          ) : (
            answer
          )}
        </div>

        {status === 'done' ? (
          <button type="button" className="response-replay" onClick={speaking ? onStop : onSpeak}>
            {speaking ? '⏹️ रुकें' : '🔊 फिर से सुनें'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
