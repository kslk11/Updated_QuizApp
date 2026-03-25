"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebar } from "./SidebarContext";

const guestLinks = [
  { to: "/",       label: "Home",    icon: "⊞" },
  { to: "/auth/login",  label: "Login",   icon: "◉" },
  { to: "/auth/signup", label: "Sign Up", icon: "◌" },
];
const adminLinks = [
  { to: "/admindashboard", label: "Dashboard",     icon: "⊞" },
  { to: "/admin",          label: "Client Manage", icon: "👥" },
];
const clientLinks = [
  { to: "/categories", label: "Manage Categories", icon: "📁" },
];
const studentLinks = [
  { to: "/",           label: "Home",        icon: "⊞" },
  { to: "/categories", label: "Test Series", icon: "📝" },
  { to: "/history",    label: "History",     icon: "⏳" },
];
const roleNames = { "1": "Admin", "2": "Client", "3": "Student" };

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { collapsed, setCollapsed } = useSidebar();

  const [token, setToken] = useState(null);
  const [role,  setRole]  = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
    const sync = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    router.push("/login");
  };

  let navLinks = guestLinks;
  if (token) {
    if (role === "1")      navLinks = adminLinks;
    else if (role === "2") navLinks = clientLinks;
    else                   navLinks = studentLinks;
  }

  return (
    <aside
      className={`h-screen flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        {!collapsed && (
          <span className="font-black text-lg text-slate-900">
            Quiz<span className="text-indigo-600">App</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-200"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {token && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            {roleNames[role] || "User"}
          </p>
        </div>
      )}

      <nav className="flex flex-col gap-1 p-2 flex-1 pt-3">
        {navLinks.map(({ to, label, icon }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              href={to}
              title={collapsed ? label : ""}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                active
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        {token && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
          >
            <span className="text-base w-5 text-center shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
}