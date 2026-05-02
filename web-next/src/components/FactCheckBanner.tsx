import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Search } from "lucide-react";
import { factChecks } from "../data/mockData";
import { useLang } from "../context/LangContext";

const VERDICT_CONFIG = {
  false:       { label: "गलत",      labelEn: "FALSE",       bg: "#C41E3A", meter: "#C41E3A" },
  misleading:  { label: "भ्रामक",   labelEn: "MISLEADING",  bg: "#C97B22", meter: "#C97B22" },
  "partly-true":{ label: "आंशिक सत्य", labelEn: "PARTLY TRUE", bg: "#E65100", meter: "#E65100" },
  true:        { label: "सच",       labelEn: "TRUE",        bg: "#2E7D32", meter: "#2E7D32" },
};

export default function FactCheckBanner() {
  const { lang, t } = useLang();

  return (
    <section className="factcheck-section">
      <div className="section-inner">
        <motion.div
          className="factcheck-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="factcheck-title-wrap">
            <Search size={17} style={{ color: "rgba(255,255,255,.8)" }} />
            <div>
              <h2 className="factcheck-title">{t("फ़ैक्ट चेक", "Fact Check")}</h2>
              <p className="factcheck-subtitle">
                {t("हम जांचते हैं, आप जानते हैं", "We verify. You know the truth.")}
              </p>
            </div>
          </div>
          <button className="factcheck-more-btn">
            {t("सभी फ़ैक्ट चेक", "All Fact Checks")} <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="factcheck-grid">
          {factChecks.map((fc, i) => {
            const cfg = VERDICT_CONFIG[fc.verdict];
            return (
              <motion.div
                key={fc.id}
                className="fc-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
              >
                <div className="fc-verdict-badge" style={{ background: cfg.bg }}>
                  <ShieldCheck size={13} />
                  {lang === "hi" ? cfg.label : cfg.labelEn}
                </div>
                <div className="fc-body">
                  <p className="fc-claim-label">{t("दावा:", "Claim:")}</p>
                  <p className="fc-claim">{lang === "hi" ? fc.claim : fc.claimEn}</p>
                  <hr className="fc-divider" />
                  <p className="fc-explanation">{lang === "hi" ? fc.explanation : fc.explanationEn}</p>
                </div>
                <div className="fc-footer">
                  <span className="fc-source">{fc.source}</span>
                  <button className="fc-read-btn">
                    {t("पूरा देखें", "Full Check")} <ArrowRight size={12} />
                  </button>
                </div>
                <div className="fc-meter" style={{ background: cfg.meter }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
