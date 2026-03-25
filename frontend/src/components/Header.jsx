"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md">
          Q
        </div>
        <span className="text-xl font-black tracking-tight text-slate-900">
          Quiz<span className="text-indigo-600">App</span>
        </span>
      </Link>

      {!token && (
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}