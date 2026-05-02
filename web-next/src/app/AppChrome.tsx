"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import SiteFooter from "../components/SiteFooter";
import { useLang } from "../context/LangContext";

const DARK_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export default function AppChrome({
  children,
  initialDark = false,
}: {
  children: React.ReactNode;
  initialDark?: boolean;
}) {
  const [darkMode, setDarkMode] = useState(initialDark);
  const { lang } = useLang();

  useEffect(() => {
    setDarkMode(initialDark);
  }, [initialDark]);

  useEffect(() => {
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const toggleDark = () => {
    setDarkMode((d) => {
      const next = !d;
      if (typeof document !== "undefined") {
        document.cookie = `kn-dark=${next ? "1" : "0"};path=/;max-age=${DARK_COOKIE_MAX_AGE};SameSite=Lax`;
      }
      try {
        localStorage.setItem("kn-dark", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="app-wrap" data-theme={darkMode ? "dark" : "light"} data-lang={lang}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      {children}
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
