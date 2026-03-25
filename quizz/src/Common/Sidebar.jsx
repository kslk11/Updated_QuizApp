import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";

// --- 1. Define Links based on Roles ---
const guestLinks = [
  { to: "/",       label: "Home",    icon: "⊞" },
  { to: "/login",  label: "Login",   icon: "◉" },
  { to: "/signup", label: "Sign Up", icon: "◌" },
];

const adminLinks = [
  { to: "/admindashboard", label: "Home",          icon: "⊞" },
  { to: "/admin",          label: "Client Manage", icon: "👥" },
];

const clientLinks = [
  { to: "/categories",       label: "Manage Categories", icon: "📁" },
];

const studentLinks = [
  { to: "/",               label: "Home",        icon: "⊞" },
  { to: "/categories",     label: "Test Series", icon: "📝" },
  { to: "/history", label: "History",     icon: "⏳" },
 
];

// --- 2. Map role numbers to display names ---
const roleNames = {
  "1": "Admin",
  "2": "Client",
  "3": "Student",
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  // Put both token and role in state so they react to changes
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole]   = useState(localStorage.getItem("role"));

  // sync token and role if changed in another tab
  useEffect(() => {
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
    navigate("/login");
  };

  //links bases on role
  let navLinks = guestLinks;
  if (token) {
    if (role === "1") navLinks = adminLinks;
    else if (role === "2") navLinks = clientLinks;
    else if (role === "3") navLinks = studentLinks;
    else navLinks = studentLinks; // Fallback just in case
  }

  const displayRole = roleNames[role] || "User";

  return (
    <aside
      className={`min-h-screen flex flex-col border-r ${t.border} ${t.bgCard} transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
    >
      <div className={`flex items-center justify-between px-4 py-4 border-b ${t.borderSubtle}`}>
        {!collapsed && (
          <span className={`font-black text-lg ${t.text}`}>
            Quiz<span className={t.accent}>App</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.textMuted} ${t.bgCardHover} transition-all border ${t.border}`}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Role Badge */}
      {token && !collapsed && (
        <div className={`mx-3 mt-3 px-3 py-2 rounded-xl ${t.accentLight} border ${t.accentBorder}`}>
          <p className={`text-xs font-bold uppercase tracking-widest ${t.accentText}`}>
            {displayRole}
          </p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-2 flex-1 pt-3">
        {navLinks.map(({ to, label, icon }) => {
          const active = location.pathname === to ||
                         (to !== "/" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : ""}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                ${active
                  ? `${t.navActive} border`
                  : `border-transparent ${t.navInactive}`}`}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className={`ml-auto w-2 h-2 rounded-full ${t.accentBg}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={`p-3 border-t ${t.borderSubtle} flex flex-col gap-2`}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border ${t.border} ${t.bgCardHover} ${t.textSecondary} transition-all`}
        >
          <span className="text-base w-5 text-center shrink-0">
            {theme === "light" ? "🌙" : "☀️"}
          </span>
          {!collapsed && (
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          )}
        </button>

        {/* Logout button*/}
        {token && (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all`}
          >
            <span className="text-base w-5 text-center shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;