// // Phone-style keypad: 7 8 9 / 4 5 6 / 1 2 3 / C 0 ✓
// const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '✓']

// const BASE =
//   'h-16 select-none touch-manipulation rounded-xl border-b-4 text-3xl font-bold transition-transform ' +
//   'active:translate-y-0.5 active:border-b-2 focus-visible:outline-4 focus-visible:outline-offset-2 ' +
//   'focus-visible:outline-wheat-400 disabled:cursor-not-allowed disabled:opacity-50'

// const STYLES = {
//   digit: 'border-leaf-300 bg-white text-leaf-900 hover:bg-leaf-100',
//   clear: 'border-wheat-500 bg-wheat-200 text-leaf-900 hover:bg-wheat-400',
//   submit: 'border-leaf-900 bg-leaf-700 text-white hover:bg-leaf-600',
// }

// export default function Numpad({ onDigit, onClear, onSubmit, submitDisabled }) {
//   return (
//     <section aria-label="नंबर पैड" className="grid grid-cols-3 gap-3">
//       {KEYS.map((key) => {
//         const isClear = key === 'C'
//         const isSubmit = key === '✓'

//         return (
//           <button
//             key={key}
//             type="button"
//             // keeps focus off the key after a click, so the Enter key on a real keyboard still submits
//             onMouseDown={(e) => e.preventDefault()}
//             onClick={isClear ? onClear : isSubmit ? onSubmit : () => onDigit(key)}
//             disabled={isSubmit && submitDisabled}
//             aria-label={isClear ? 'साफ़ करें' : isSubmit ? 'जवाब पाएं' : `नंबर ${key}`}
//             className={`${BASE} ${isClear ? STYLES.clear : isSubmit ? STYLES.submit : STYLES.digit}`}
//           >
//             {key}
//           </button>
//         )
//       })}
//     </section>
//   )
// }

// Phone-style keypad: 7 8 9 / 4 5 6 / 1 2 3 / C 0 ✓
// Props are the same as before: onDigit, onClear, onSubmit, submitDisabled.
const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '✓']

// Moves the soft light of the press effect to where the finger touched.
function setRipple(event) {
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  button.style.setProperty('--ripple-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
  button.style.setProperty('--ripple-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
}

export default function Numpad({ onDigit, onClear, onSubmit, submitDisabled }) {
  return (
    <section className="numpad-section" id="numpad-section" aria-label="नंबर पैड">
      <div className="numpad-grid" id="numpad-grid">
        {KEYS.map((key) => {
          const isClear = key === 'C'
          const isSubmit = key === '✓'

          return (
            <button
              key={key}
              type="button"
              id={isClear ? 'btn-clear' : isSubmit ? 'btn-submit' : `btn-${key}`}
              className={
                isClear
                  ? 'numpad-btn action-btn clear-btn'
                  : isSubmit
                    ? 'numpad-btn action-btn submit-btn'
                    : 'numpad-btn num-btn'
              }
              disabled={isSubmit && submitDisabled}
              aria-label={isClear ? 'मिटाएं' : isSubmit ? 'जवाब पाएं' : `नंबर ${key}`}
              onPointerDown={setRipple}
              onMouseDown={(event) => event.preventDefault()}
              onClick={isClear ? onClear : isSubmit ? onSubmit : () => onDigit(key)}
            >
              {key}
            </button>
          )
        })}
      </div>
    </section>
  )
}
