import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const Login = () => {
  const { t }    = useTheme();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
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
      console.log(res.data.user.name)
      const { token } = res.data;

      // persist to localStorage
      localStorage.setItem("token",  token);
      localStorage.setItem("role",   res.data.user.role_id);
      localStorage.setItem("userId", res.data.user.id);

      // window.dispatchEvent(new Event("localStorageUpdated"));

      toast.success("Login successful! Welcome back 👋");
      if(res.data.user.role_id==1){
        navigate("/admindashboard")
      }else if(res.data.user.role_id==2){
        navigate('/categories')
      }
      else {
        navigate('/')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // allow submit on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center px-4 transition-colors duration-300`}>
      <div className="w-full max-w-md">
        <div className={`${t.bgCard} border ${t.border} rounded-3xl p-8 shadow-xl ${t.shadow}`}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-14 h-14 ${t.accentBg} rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-md`}>
              🔐
            </div>
            <h2 className={`text-2xl font-black ${t.text}`}>Welcome back</h2>
            <p className={`${t.textMuted} text-sm mt-1`}>
              Sign in to continue your quiz journey
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {[
              { name: "email",    label: "Email address", type: "email",    placeholder: "you@example.com" },
              { name: "password", label: "Password",      type: "password", placeholder: "••••••••" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-2 block`}>
                  {label}
                </label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-sm ${t.text} placeholder:${t.textMuted} focus:outline-none focus:ring-2 ${t.inputFocus} transition`}
                />
              </div>
            ))}

            <div className="flex justify-end -mt-2">
              <a href="#" className={`text-xs font-semibold ${t.accent} hover:underline`}>
                Forgot password?
              </a>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full ${t.accentBg} ${t.accentBgHover} disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all`}
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

          <p className={`text-center text-xs ${t.textMuted} mt-6`}>
            Don't have an account?{" "}
            <Link to="/signup" className={`${t.accentText} font-bold hover:underline`}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;