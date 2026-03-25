"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const links = token
    ? [
        { to: "/", label: "Home" },
        { to: "/categories", label: "Categories" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Sign Up" },
      ];

  return (
    <footer className="bg-white border-t border-slate-200 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black">
            Q
          </div>
          <span className="font-black text-base text-slate-900">
            Quiz<span className="text-indigo-600">App</span>
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className="text-sm text-slate-400 font-medium hover:text-slate-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-slate-400 text-center">
          © 2025 QuizApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}