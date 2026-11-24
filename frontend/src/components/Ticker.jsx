import { useEffect, useState } from 'react'

const SHOW_MS = 3000 // how long each menu line stays
const FADE_OUT_MS = 300
const FADE_IN_MS = 400

// The light bar under the pill. It shows the menu one line at a time ("8. फोटो से रोग पहचान"),
// changing every 3 seconds with a fade, like the reference page.
//   activeIndex  >= 0 while the menu is being read aloud: the bar then shows the item being read
//   onSelect     optional: tapping the bar calls onSelect(key) for the item showing
export default function Ticker({ items, loading, error, onRetry, activeIndex = -1, onSelect }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('idle') // 'idle' | 'out' | 'in'

  useEffect(() => {
    if (items.length < 2) return undefined

    let fadeTimer
    let settleTimer

    const interval = setInterval(() => {
      setPhase('out')
      fadeTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length)
        setPhase('in')
        settleTimer = setTimeout(() => setPhase('idle'), FADE_IN_MS)
      }, FADE_OUT_MS)
    }, SHOW_MS)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeTimer)
      clearTimeout(settleTimer)
    }
  }, [items.length])

  const reading = activeIndex >= 0 && activeIndex < items.length
  const shown = items.length ? (reading ? activeIndex : index % items.length) : -1
  const current = shown >= 0 ? items[shown] : null

  const phaseClass = reading
    ? ' ticker-fade-in'
    : phase === 'out'
      ? ' ticker-fade-out'
      : phase === 'in'
        ? ' ticker-fade-in'
        : ''
  const boxKey = reading ? `read-${activeIndex}` : 'auto' // new key = the fade-in plays again

  let content
  if (loading) {
    content = (
      <div className="ticker-box" id="ticker-text">
        मेनू लोड हो रहा है…
      </div>
    )
  } else if (error) {
    content = (
      <div className="ticker-box" id="ticker-text">
        <span role="alert">{error}</span>
        {onRetry ? (
          <button type="button" className="ticker-retry" onClick={onRetry}>
            दोबारा कोशिश करें
          </button>
        ) : null}
      </div>
    )
  } else if (current && onSelect) {
    content = (
      <button
        key={boxKey}
        type="button"
        className={`ticker-box${phaseClass}`}
        id="ticker-text"
        title="इस विकल्प को चुनें"
        onClick={() => onSelect(current.key)}
      >
        {`${current.key}. ${current.label}`}
      </button>
    )
  } else if (current) {
    content = (
      <div key={boxKey} className={`ticker-box${phaseClass}`} id="ticker-text">
        {`${current.key}. ${current.label}`}
      </div>
    )
  } else {
    content = (
      <div className="ticker-box" id="ticker-text">
        मेनू उपलब्ध नहीं है
      </div>
    )
  }

  return (
    <div className="ticker-container" id="ticker-container">
      {content}
    </div>
  )
}
