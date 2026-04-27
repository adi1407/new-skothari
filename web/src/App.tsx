import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  Landmark, Trophy, Cpu, Briefcase, Clapperboard, HeartPulse,
} from "lucide-react";
import { LangProvider, useLang } from "./context/LangContext";
import { ReaderAuthProvider } from "./context/ReaderAuthContext";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import SiteFooter from "./components/SiteFooter";
import HeroSection from "./components/HeroSection";
import NewsTicker from "./components/NewsTicker";
import LatestNews from "./components/LatestNews";
import CategorySection from "./components/CategorySection";
import ShowsSection from "./components/ShowsSection";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import ShowsPage from "./pages/ShowsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import type { NewsItem } from "./data/mockData";
import { loadHomeArticles, pickCategory } from "./services/homeFeed";
import "./index.css";

function HomePage() {
  const { lang } = useLang();
  const [feed, setFeed] = useState<NewsItem[]>([]);

  useEffect(() => {
    loadHomeArticles(120, lang).then(setFeed);
  }, [lang]);

  const bucket = (slug: string) => pickCategory(feed, slug, 12);

  const politicsList = bucket("politics");
  const sportsList = bucket("sports");
  const techList = bucket("tech");
  const bizList = bucket("business");
  const entList = bucket("entertainment");
  const healthList = bucket("health");

  return (
    <main>
      {/* Breaking + Latest hero */}
      <HeroSection />
      <NewsTicker />
      <LatestNews />

      {/* Politics — full rail */}
      {politicsList.length > 0 && (
      <CategorySection
        titleHi="राजनीति"
        titleEn="Politics"
        icon={<Landmark size={18} />}
        color="#BB1919"
        slug="politics"
        variant="rail"
        mainStory={politicsList[0]}
        gridStories={politicsList.slice(1, 4)}
      />
      )}

      {/* Sports — compact 4-up */}
      {sportsList.length > 0 && (
      <CategorySection
        titleHi="खेल"
        titleEn="Sports"
        icon={<Trophy size={18} />}
        color="#00695C"
        slug="sports"
        variant="compact"
        mainStory={sportsList[0]}
        gridStories={sportsList.slice(1, 4)}
        bgAlt
      />
      )}

      {/* Tech — rail */}
      {techList.length > 0 && (
      <CategorySection
        titleHi="तकनीक"
        titleEn="Tech"
        icon={<Cpu size={18} />}
        color="#1565c0"
        slug="tech"
        variant="rail"
        mainStory={techList[0]}
        gridStories={techList.slice(1, 4)}
      />
      )}

      {/* Business — list-first (analysis-style) */}
      {bizList.length > 0 && (
      <CategorySection
        titleHi="व्यापार"
        titleEn="Business"
        icon={<Briefcase size={18} />}
        color="#e65100"
        slug="business"
        variant="listFirst"
        mainStory={bizList[0]}
        gridStories={bizList.slice(1, 4)}
        bgAlt
      />
      )}

      {/* Entertainment — compact */}
      {entList.length > 0 && (
      <CategorySection
        titleHi="मनोरंजन"
        titleEn="Entertainment"
        icon={<Clapperboard size={18} />}
        color="#6a1b9a"
        slug="entertainment"
        variant="compact"
        mainStory={entList[0]}
        gridStories={entList.slice(1, 4)}
      />
      )}

      {/* Health — rail */}
      {healthList.length > 0 && (
      <CategorySection
        titleHi="स्वास्थ्य"
        titleEn="Health"
        icon={<HeartPulse size={18} />}
        color="#1b5e20"
        slug="health"
        variant="rail"
        mainStory={healthList[0]}
        gridStories={healthList.slice(1, 4)}
        bgAlt
      />
      )}

      {/* Shows / YouTube */}
      <ShowsSection />
    </main>
  );
}

function AppInner() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("kn-dark") === "1");
  const { lang } = useLang();

  const toggleDark = () => {
    setDarkMode((d) => {
      const next = !d;
      localStorage.setItem("kn-dark", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="app-wrap" data-theme={darkMode ? "dark" : "light"} data-lang={lang}>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <Routes>
        <Route path="/"            element={<><HomePage /><SiteFooter /></>} />
        <Route path="/shows"       element={<><ShowsPage /><SiteFooter /></>} />
        <Route path="/article/:id" element={<><ArticlePage /><SiteFooter /></>} />
        <Route path="/category/:slug" element={<><CategoryPage /><SiteFooter /></>} />
        <Route path="/login"       element={<><LoginPage /><SiteFooter /></>} />
        <Route path="/register"    element={<><RegisterPage /><SiteFooter /></>} />
        <Route path="/profile"     element={<><ProfilePage /><SiteFooter /></>} />
      </Routes>
      <BottomNav />
    </div>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  const inner = <AppInner />;
  return (
    <BrowserRouter>
      <LangProvider>
        <ReaderAuthProvider>
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>
          ) : (
            inner
          )}
        </ReaderAuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
