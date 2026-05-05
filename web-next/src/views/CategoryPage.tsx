import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { categories } from "../data/publicCategories";
import type { NewsItem } from "../data/mockData";
import { useLang } from "../context/LangContext";
import NewsCard from "../components/NewsCard";
import { fetchPublishedArticles } from "../services/newsApi";
import { adaptArticles } from "../services/articleAdapter";

const catColors: Record<string, string> = {
  desh: "#BB1919", videsh: "#1A3A6B", rajneeti: "#810102",
  khel: "#00695C", health: "#1B6B3A", krishi: "#2E7D32",
  business: "#7C4A00", manoranjan: "#6B1FA5", home: "#BB1919", latest: "#BB1919",
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLang();

  const cat = categories.find((c) => c.slug === slug);

  const [stories, setStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    const isAllFeed = slug === "home";
    const isLatest = slug === "latest";
    fetchPublishedArticles({
      ...(isAllFeed || isLatest ? {} : { category: slug }),
      ...(isLatest ? { latestDays: 3 } : {}),
      limit: 40,
      locale: lang,
    }).then((articles) => {
      setStories(adaptArticles(articles));
      setLoading(false);
    });
  }, [slug, lang]);

  if (!cat) {
    return (
      <div className="cat-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 120 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          {t("श्रेणी नहीं मिली", "Category not found")}
        </h2>
        <button className="article-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> {t("होम पर जाएं", "Go to Home")}
        </button>
      </div>
    );
  }

  const catName = lang === "hi" ? cat.name : cat.nameEn;
  const color = catColors[slug ?? ""] || "#BB1919";

  return (
    <motion.div
      className="cat-page"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="cat-page-header" style={{ borderTopColor: color }}>
        <div className="cat-page-header-inner">
          <button className="article-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            {t("वापस", "Back")}
          </button>
          <div style={{ marginTop: 20 }}>
            <h1 className="cat-page-title">{catName}</h1>
            <p className="cat-page-count" style={{ color }}>
              {loading
                ? "…"
                : slug === "latest"
                  ? `${stories.length} ${t("खबरें · पिछले 3 दिन", "stories · last 3 days")}`
                  : `${stories.length} ${t("खबरें", "stories")}`}
            </p>
          </div>
        </div>
      </div>

      <div className="cat-page-body">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "var(--brand-red)" }} />
          </div>
        ) : stories.length === 0 ? (
          <p style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-500)", fontFamily: "var(--font-ui)" }}>
            {t("इस श्रेणी में कोई खबर नहीं है।", "No stories in this category yet.")}
          </p>
        ) : (
          <motion.div
            className="cat-page-grid"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {stories.map((item, i) => (
              <NewsCard key={String(item.id)} item={item} variant="default" index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
