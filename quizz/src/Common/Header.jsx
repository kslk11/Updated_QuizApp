import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";

function Header() {
  const { t } = useTheme();
  const token = localStorage.getItem("token");

  return (
    <header
      className={`sticky top-0 z-50 px-6 py-3 flex items-center justify-between ${t.bgCard} border-b ${t.border}`}
    >
      <Link to="/" className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${t.accentBg} flex items-center justify-center text-white text-lg font-black shadow-md`}>
          Q
        </div>
        <span className={`text-xl font-black tracking-tight ${t.text}`}>
          Quiz<span className={t.accent}>App</span>
        </span>
      </Link>

      {!token && (
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} transition-all`}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={`px-4 py-2 rounded-xl text-sm font-bold ${t.accentBg} ${t.accentBgHover} text-white shadow-md transition-all`}
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;