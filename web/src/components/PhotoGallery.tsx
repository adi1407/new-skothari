import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { photoGallery } from "../data/mockData";
import { useLang } from "../context/LangContext";

export default function PhotoGallery() {
  const { lang, t } = useLang();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const featured = photoGallery.find((p) => p.isFeatured)!;
  const rest = photoGallery.filter((p) => !p.isFeatured);

  const allOrdered = [featured, ...rest];
  const currentIdx = lightbox !== null ? lightbox : 0;

  const prev = () => setLightbox((i) => ((i ?? 0) - 1 + allOrdered.length) % allOrdered.length);
  const next = () => setLightbox((i) => ((i ?? 0) + 1) % allOrdered.length);

  return (
    <section className="section gallery-section">
      <div className="section-inner">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-title-wrap">
            <Camera size={17} style={{ color: "var(--brand-red)" }} />
            <h2 className="section-title">{t("तस्वीरों में खबर", "In Pictures")}</h2>
          </div>
          <button className="section-more-btn">
            {t("सभी फोटो", "Photo Archive")} <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="gallery-grid">
          {/* Featured — spans 2×2 */}
          <motion.div
            className="gallery-card gallery-featured"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => setLightbox(0)}
          >
            <img src={featured.image} alt={lang === "hi" ? featured.caption : featured.captionEn} className="gallery-img" loading="lazy" />
            <div className="gallery-overlay">
              <span className="gallery-essay-badge">{t("फोटो एसे", "PHOTO ESSAY")}</span>
              <div className="gallery-overlay-text">
                <span className="gallery-cat">{lang === "hi" ? featured.category : featured.categoryEn}</span>
                <p className="gallery-caption">{lang === "hi" ? featured.caption : featured.captionEn}</p>
                <span className="gallery-photo-credit">{featured.photographer}</span>
              </div>
            </div>
          </motion.div>

          {/* Rest */}
          {rest.map((photo, i) => (
            <motion.div
              key={photo.id}
              className="gallery-card"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              onClick={() => setLightbox(i + 1)}
            >
              <img src={photo.image} alt={lang === "hi" ? photo.caption : photo.captionEn} className="gallery-img" loading="lazy" />
              <div className="gallery-overlay">
                <div className="gallery-overlay-text">
                  <span className="gallery-cat">{lang === "hi" ? photo.category : photo.categoryEn}</span>
                  <p className="gallery-caption">{lang === "hi" ? photo.caption : photo.captionEn}</p>
                  <span className="gallery-photo-credit">{photo.photographer}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="gallery-lightbox-inner"
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allOrdered[currentIdx]?.image}
                alt=""
                className="gallery-lightbox-img"
              />
              <p className="gallery-lightbox-caption">
                {lang === "hi"
                  ? allOrdered[currentIdx]?.caption
                  : allOrdered[currentIdx]?.captionEn}
              </p>
              <span className="gallery-lightbox-credit">
                {allOrdered[currentIdx]?.photographer}
              </span>
              <button className="gallery-lb-close" onClick={() => setLightbox(null)}>
                <X size={20} />
              </button>
              <button className="gallery-lb-prev" onClick={prev}><ChevronLeft size={24} /></button>
              <button className="gallery-lb-next" onClick={next}><ChevronRight size={24} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
