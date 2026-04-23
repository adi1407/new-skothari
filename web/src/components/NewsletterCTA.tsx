import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, ArrowRight, Users, CheckCircle } from "lucide-react";
import { useLang } from "../context/LangContext";

const AVATAR_LETTERS = ["R", "P", "A", "S", "M"];
const TARGET_COUNT = 2000000;

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K+";
  return String(n);
}

export default function NewsletterCTA() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * TARGET_COUNT));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="newsletter-section" ref={ref}>
      <div className="newsletter-inner">
        <div className="newsletter-left">
          <div className="newsletter-icon-wrap">
            <Mail size={24} color="white" />
          </div>
          <div className="newsletter-badge">{t("न्यूज़लेटर", "Newsletter")}</div>
          <h2 className="newsletter-headline">
            {t("देश की सबसे बड़ी खबरें\nसुबह 8 बजे", "India's biggest stories\nevery morning at 8 AM")}
          </h2>
          <div className="newsletter-social-proof">
            <div className="newsletter-avatars">
              {AVATAR_LETTERS.map((l, i) => (
                <span key={i} className="newsletter-avatar" style={{ zIndex: 5 - i }}>
                  {l}
                </span>
              ))}
            </div>
            <div className="newsletter-count-wrap">
              <Users size={14} />
              <span className="newsletter-count">{formatCount(count)}</span>
              <span className="newsletter-count-label">
                {t("पाठक जुड़ चुके हैं", "readers subscribed")}
              </span>
            </div>
          </div>
        </div>

        <div className="newsletter-right">
          {submitted ? (
            <motion.div
              className="newsletter-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle size={32} className="newsletter-success-icon" />
              <p>{t("शुक्रिया! आप सफलतापूर्वक जुड़ गए।", "Thank you! You're subscribed.")}</p>
            </motion.div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="newsletter-input"
                placeholder={t("आपका ईमेल पता…", "your@email.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-submit-btn">
                {t("सब्सक्राइब करें", "Subscribe Free")}
                <ArrowRight size={16} />
              </button>
              <p className="newsletter-privacy">
                {t("हम स्पैम नहीं करेंगे। कभी नहीं।", "We won't spam you. Ever.")}
              </p>
            </form>
          )}
          <div className="newsletter-already">
            {t("पहले से सब्सक्राइब किया?", "Already subscribed?")}{" "}
            <button className="newsletter-manage-btn">
              {t("प्राथमिकताएं बदलें", "Manage preferences")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
