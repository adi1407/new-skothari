import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutGrid, Video, User } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useReaderAuth } from "../context/ReaderAuthContext";

export default function BottomNav() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { reader } = useReaderAuth();

  const active = useMemo(() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/category")) return "categories";
    if (pathname.startsWith("/shows")) return "videos";
    if (pathname.startsWith("/profile") || pathname.startsWith("/login")) return "profile";
    return "";
  }, [pathname]);

  const tabs = [
    { id: "home", path: "/", labelHi: "होम", labelEn: "Home", Icon: Home },
    { id: "categories", path: "/category/latest", labelHi: "श्रेणी", labelEn: "Categories", Icon: LayoutGrid },
    { id: "videos", path: "/shows", labelHi: "वीडियो", labelEn: "Videos", Icon: Video },
    {
      id: "profile",
      path: reader ? "/profile" : "/login?next=%2Fprofile",
      labelHi: "प्रोफ़ाइल",
      labelEn: "Profile",
      Icon: User,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label={lang === "hi" ? "मुख्य नेविगेशन" : "Main navigation"}>
      {tabs.map(({ id, path, labelHi, labelEn, Icon }) => (
        <motion.button
          key={id}
          type="button"
          className={`bottom-nav-tab ${active === id ? "active" : ""}`}
          onClick={() => navigate(path)}
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
