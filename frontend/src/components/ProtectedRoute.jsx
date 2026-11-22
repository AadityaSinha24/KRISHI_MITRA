import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// guestOnly: for login/register (logged-in users get sent to the dashboard)
export default function ProtectedRoute({ children, guestOnly = false }) {
  const { user, loading } = useSelector((s) => s.auth);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  if (guestOnly) return user ? <Navigate to="/" replace /> : children;
  return user ? children : <Navigate to="/login" replace />;
}