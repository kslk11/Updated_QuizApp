"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config/api";

export default function LoginPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form);
      const { token } = res.data;

      localStorage.setItem("token",  token);
      localStorage.setItem("role",   res.data.user.role_id);
      localStorage.setItem("userId", res.data.user.id);

      toast.success("Login successful! Welcome back 👋");

      if (res.data.user.role_id == 1)      router.push("/admin/admindashboard");
      else if (res.data.user.role_id == 2) router.push("/course");
      else                                 router.push("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const fields = [
    { name: "email",    label: "Email address", type: "email",    placeholder: "you@example.com" },
    { name: "password", label: "Password",      type: "password", placeholder: "••••••••"        },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-md">
              🔐
            </div>
            <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to continue your quiz journey
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            ))}

            <div className="flex justify-end -mt-2">
              <a href="#" className="text-xs font-semibold text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 font-bold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}