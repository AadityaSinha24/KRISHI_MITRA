import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/authSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const onLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Welcome, {user.fullname}</h1>
        <p>Phone: {user.phoneNumber}</p>
        {user.city && <p>City: {user.city}</p>}
        {user.state && <p>State: {user.state}</p>}
        {user.country && <p>Country: {user.country}</p>}
        <button onClick={onLogout} className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  );
}