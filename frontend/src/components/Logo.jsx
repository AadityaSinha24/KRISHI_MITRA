// Leaf icon + "Kisan Mitra" + tagline (same markup as the reference header).
export default function Logo() {
  return (
    <div className="logo-section">
      <div className="logo-icon" id="logo-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M24 4C24 4 18 12 18 20C18 24 20 28 24 30C28 28 30 24 30 20C30 12 24 4 24 4Z"
            fill="#4ade80"
          />
          <path d="M24 30V44" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 36C16 36 20 32 24 34" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 34C32 34 28 30 24 32" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="logo-text">
        <h1>Kisan Mitra</h1>
        <p className="tagline">आपका डिजिटल कृषि सहायक</p>
      </div>
    </div>
  )
}
