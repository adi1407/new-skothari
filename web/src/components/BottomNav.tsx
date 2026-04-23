import { useState } from "react";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Video, User } from "lucide-react";
import { useLang } from "../context/LangContext";

export default function BottomNav() {
  const [active, setActive] = useState("home");
  const { lang } = useLang();

  const tabs = [
    { id: "home",       labelHi: "होम",      labelEn: "Home",       Icon: Home },
    { id: "categories", labelHi: "श्रेणी",   labelEn: "Categories", Icon: LayoutGrid },
    { id: "videos",     labelHi: "वीडियो",   labelEn: "Videos",     Icon: Video },
    { id: "profile",    labelHi: "प्रोफ़ाइल", labelEn: "Profile",    Icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, labelHi, labelEn, Icon }) => (
        <motion.button
          key={id}
          className={`bottom-nav-tab ${active === id ? "active" : ""}`}
          onClick={() => setActive(id)}
          whileTap={{ scale: 0.9 }}
        >
          {active === id && (
            <motion.div
              className="bottom-nav-indicator"
              layoutId="bottom-nav-indicator"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <Icon size={22} strokeWidth={active === id ? 2.2 : 1.8} />
          <span>{lang === "hi" ? labelHi : labelEn}</span>
        </motion.button>
      ))}
    </nav>
  );
}
