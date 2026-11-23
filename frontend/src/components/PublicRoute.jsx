import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

import { selectAuthStatus } from '../store/authSlice'
import Loader from './Loader'

// Login and register pages: logged-in users are sent to the dashboard instead.
export default function PublicRoute() {
  const status = useSelector(selectAuthStatus)

  if (status === 'checking') return <Loader fullScreen />
  if (status === 'authenticated') return <Navigate to="/" replace />

  return <Outlet />
}
