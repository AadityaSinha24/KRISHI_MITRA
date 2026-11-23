import { Navigate,Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectAuthStatus } from '../store/authSlice'
import Loader from './Loader'

// guestOnly: for login/register (logged-in users get sent to the dashboard)
export default function ProtectedRoute() {
  const status = useSelector(selectAuthStatus)

  if (status === 'checking') return <Loader fullScreen />
  if (status !== 'authenticated') return <Navigate to="/login" replace />

  return <Outlet />
}