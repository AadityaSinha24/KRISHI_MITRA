import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { logoutUser } from '../services/authService'
import { clearUser, selectUser } from '../store/authSlice'

export default function Header() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const onLogout = async () => {
    setBusy(true)
    try {
      await logoutUser()
    } catch {
      // Even if the server call fails, the user is signed out on this device.
    } finally {
      dispatch(clearUser())
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="flex items-start justify-between gap-3 py-5">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-leaf-800">
          <span aria-hidden="true">🌾 </span>किसान मित्र
        </h1>
        <p className="text-base text-leaf-700">आपका डिजिटल कृषि सहायक</p>
        {user?.fullname ? (
          <p className="mt-1 text-sm text-soil/70">नमस्ते, {user.fullname}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={busy}
        className="shrink-0 rounded-lg border-2 border-leaf-300 bg-white px-3 py-2 text-sm font-medium
          text-leaf-800 hover:bg-leaf-100 disabled:opacity-60
          focus-visible:outline-4 focus-visible:outline-wheat-400"
      >
        लॉग आउट
      </button>
    </header>
  )
}
