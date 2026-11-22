import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";

const field = "w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phoneNumber: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await dispatch(loginUser(form));
    setSubmitting(false);

    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    } else {
      setError(result.payload || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <input className={field} name="phoneNumber" placeholder="Phone number" value={form.phoneNumber} onChange={onChange} required />
        <input className={field} type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required />

        <button disabled={submitting} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  );
}