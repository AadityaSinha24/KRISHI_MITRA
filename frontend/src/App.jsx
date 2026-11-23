import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { clearUser, fetchCurrentUser } from './store/authSlice'

export default function App() {
  const dispatch = useDispatch()
  const started = useRef(false)

  // Ask the backend who we are once, when the app opens (cookies carry the session).
  useEffect(() => {
    if (started.current) return
    started.current = true
    dispatch(fetchCurrentUser())
  }, [dispatch])

  // api.js fires this when a token refresh fails, so the user is sent to login.
  useEffect(() => {
    const onExpired = () => dispatch(clearUser())
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [dispatch])

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="px-4 py-5 text-center text-sm text-leaf-800/80">
        किसान मित्र © {new Date().getFullYear()} — किसानों को सशक्त बनाना
      </footer>
    </div>
  )
}
