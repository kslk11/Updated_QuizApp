"use client";
import { useSidebar } from "./SidebarContext";

export default function MainContent({ children }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`flex flex-col flex-1 transition-all duration-300 ${
        collapsed ? "ml-16" : "ml-60"
      }`}
    >
      {children}
    </div>
  );
}