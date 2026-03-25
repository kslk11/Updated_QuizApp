"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config/api";


export default function SignupPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/student/register`, form);
      toast.success(res.data.message || "Account created successfully 🎉");
      router.push("/login");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name",     label: "Full Name",      type: "text",     placeholder: "Jane Doe"          },
    { name: "email",    label: "Email Address",  type: "email",    placeholder: "you@example.com"   },
    { name: "password", label: "Password",       type: "password", placeholder: "Min. 8 characters" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-md">
              ✨
            </div>
            <h2 className="text-2xl font-black text-slate-900">Create account</h2>
            <p className="text-slate-400 text-sm mt-1">
              Join thousands of quiz enthusiasts today
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
                  placeholder={placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}