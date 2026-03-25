"use client";
import { useEffect } from "react";

export default function useTabSwitch(onTabChange) {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        onTabChange();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
