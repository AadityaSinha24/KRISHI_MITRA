import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../conf/api";

const field = "w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phoneNumber: "", fullname: "", password: "", city: "", state: "", country: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // backend rejects empty strings for optional fields, so send only filled ones
    const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ""));

    try {
      await api.post("/users/register", body);
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create account</h1>
        {error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <input className={field} name="fullname" placeholder="Full name" value={form.fullname} onChange={onChange} required />
        <input className={field} name="phoneNumber" placeholder="Phone number" value={form.phoneNumber} onChange={onChange} required />
        <input className={field} type="password" name="password" placeholder="Password (min 8 characters)" value={form.password} onChange={onChange} required />
        <input className={field} name="city" placeholder="City (optional)" value={form.city} onChange={onChange} />
        <input className={field} name="state" placeholder="State (optional)" value={form.state} onChange={onChange} />
        <input className={field} name="country" placeholder="Country (optional)" value={form.country} onChange={onChange} />

        <button disabled={submitting} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? "Creating..." : "Register"}
        </button>
        <p className="text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}