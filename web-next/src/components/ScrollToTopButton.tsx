"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useLang } from "../context/LangContext";
import styles from "./scroll-to-top.module.css";

const THRESHOLD = 420;
const SCROLL_DEBOUNCE_MS = 120;

export default function ScrollToTopButton() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (tid) clearTimeout(tid);
      tid = setTimeout(() => {
        setVisible(window.scrollY > THRESHOLD);
      }, SCROLL_DEBOUNCE_MS);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (tid) clearTimeout(tid);
    };
  }, []);

  const scrollTop = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <button
      type="button"
      className={`${styles.btn} ${visible ? "" : styles.btnHidden}`}
      aria-label={t("ऊपर जाएँ", "Scroll to top")}
      title={t("ऊपर जाएँ", "Scroll to top")}
      onClick={scrollTop}
    >
      <ChevronUp size={24} strokeWidth={2.4} aria-hidden />
    </button>
  );
}
