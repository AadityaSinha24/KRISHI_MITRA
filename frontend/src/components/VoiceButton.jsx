// The green pill under the logo: reads the menu aloud, and stops it when pressed again.
export default function VoiceButton({ speaking, disabled, onClick }) {
  return (
    <div className="voice-greeting-wrapper" id="voice-greeting-wrapper">
      <button
        type="button"
        className={`voice-greeting-btn${speaking ? ' speaking' : ''}`}
        id="voice-greeting-btn"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="voice-btn-icon" aria-hidden="true">
          {speaking ? '⏹️' : '🔊'}
        </span>
        <span className="voice-btn-label">{speaking ? 'रुकें' : 'मेनू सुनें'}</span>
      </button>
    </div>
  )
}
