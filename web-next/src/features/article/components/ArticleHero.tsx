"use client";

import { motion, type MotionValue } from "framer-motion";

export default function ArticleHero({
  scaleX,
  imageSrc,
  imageAlt,
  imgErr,
  onImgError,
}: {
  scaleX: MotionValue<number>;
  imageSrc: string;
  imageAlt: string;
  imgErr: boolean;
  onImgError: () => void;
}) {
  return (
    <>
      <motion.div className="article-progress-bar" style={{ scaleX, transformOrigin: "0%" }} />
      <div className="article-hero-wrap">
        {!imgErr ? (
          <img src={imageSrc} alt={imageAlt} className="article-hero-img" onError={onImgError} />
        ) : (
          <div className="article-hero-fallback" />
        )}
      </div>
    </>
  );
}
