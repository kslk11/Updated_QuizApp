import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";

const Footer = () => {
  const { t }                 = useTheme();
  const [token, setToken]     = useState(localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const links = token
    ? [
        { to: "/",           label: "Home" },
        { to: "/categories", label: "Categories" },
      ]
    : [
        { to: "/",       label: "Home" },
        { to: "/login",  label: "Login" },
        { to: "/signup", label: "Sign Up" },
      ];

  return (
    <footer className={`${t.bgCard} border-t ${t.border} py-8 px-6 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${t.accentBg} flex items-center justify-center text-white text-sm font-black`}>
            Q
          </div>
          <span className={`font-black text-base ${t.text}`}>
            Quiz<span className={t.accent}>App</span>
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm ${t.textMuted} font-medium transition-colors`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className={`text-xs ${t.textMuted} text-center`}>
          © 2025 QuizApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;