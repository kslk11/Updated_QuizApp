import { useState, useEffect, createContext, useContext } from "react";

export const ThemeContext = createContext();

export const themes = {
  light: {
    name: "light",
    bg: "",
    bgSecondary: "bg-orange-50",
    bgCard: "bg-white",
    bgCardHover: "hover:bg-amber-50",
    border: "border-amber-200",
    borderSubtle: "border-amber-100",
    text: "text-slate-800",
    textSecondary: "text-slate-500",
    textMuted: "text-slate-400",
    accent: "text-teal-600",
    accentBg: "bg-teal-600",
    accentBgHover: "hover:bg-teal-500",
    accentLight: "bg-teal-50",
    accentBorder: "border-teal-300",
    accentText: "text-teal-700",
    inputBg: "bg-white",
    inputBorder: "border-amber-300",
    inputFocus: "focus:border-teal-400 focus:ring-teal-200",
    navActive: "bg-teal-50 text-teal-700 border-teal-200",
    navInactive: "text-slate-500 hover:bg-amber-100 hover:text-slate-700",
    shadow: "shadow-amber-100",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
  },
  dark: {
    name: "dark",
    bg: "bg-slate-800",
    bgSecondary: "bg-slate-750",
    bgCard: "bg-slate-700",
    bgCardHover: "hover:bg-slate-650",
    border: "border-slate-600",
    borderSubtle: "border-slate-600/50",
    text: "text-slate-100",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-400",
    accent: "text-cyan-400",
    accentBg: "bg-cyan-500",
    accentBgHover: "hover:bg-cyan-400",
    accentLight: "bg-cyan-900/40",
    accentBorder: "border-cyan-600",
    accentText: "text-cyan-300",
    inputBg: "bg-slate-600",
    inputBorder: "border-slate-500",
    inputFocus: "focus:border-cyan-500 focus:ring-cyan-900",
    navActive: "bg-cyan-900/50 text-cyan-300 border-cyan-700",
    navInactive: "text-slate-400 hover:bg-slate-600 hover:text-slate-200",
    shadow: "shadow-slate-900",
    badge: "bg-cyan-900/50 text-cyan-300 border-cyan-700",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("quiz-theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("quiz-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, t: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};