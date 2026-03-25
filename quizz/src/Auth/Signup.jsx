import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { t } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!form.name || !form.email || !form.password) {
        toast.error("All fields are required");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://3.7.176.131:9000/api/student/register",
        form
      );

      toast.success(res.data.message || "Account created successfully 🎉");
      navigate('/login')

      setForm({
        name: "",
        email: "",
        password: ""
      });

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center px-4 transition-colors duration-300`}>
      <div className="w-full max-w-md">
        <div className={`${t.bgCard} border ${t.border} rounded-3xl p-8 shadow-xl ${t.shadow}`}>

          <div className="text-center mb-8">
            <h2 className={`text-2xl font-black ${t.text}`}>Create account</h2>
            <p className={`${t.textMuted} text-sm mt-1`}>
              Join thousands of quiz enthusiasts today
            </p>
          </div>

          <div className="flex flex-col gap-5">

            {[
              { name: "name", label: "Full Name", type: "text", placeholder: "Jane Doe" },
              { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
              { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" }
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
                  placeholder={placeholder}
                  className={`w-full ${t.inputBg} border ${t.inputBorder} rounded-xl px-4 py-3 text-sm ${t.text} placeholder:${t.textMuted} focus:outline-none focus:ring-2 ${t.inputFocus} transition`}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full ${t.accentBg} ${t.accentBgHover} disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all`}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>

          </div>

          <p className={`text-center text-xs ${t.textMuted} mt-6`}>
            Already have an account?{" "}
            <Link to="/login" className={`${t.accentText} font-bold hover:underline`}>
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;