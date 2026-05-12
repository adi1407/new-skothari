"use client";

import Link from "next/link";
import { useLang } from "../context/LangContext";
import WeatherWidget from "./WeatherWidget";
import styles from "./home-discover-row.module.css";

/** Weather + hint so Open-Meteo / mixed headlines are visible without scrolling to the footer. */
export default function HomeDiscoverRow() {
  const { lang, t } = useLang();

  return (
    <section className={styles.wrap} aria-label={t("मौसम व खोज", "Weather and discovery")}>
      <div className={styles.grid}>
        <WeatherWidget variant="surface" />
        <div className={styles.hint}>
          <p className={styles.hintTitle}>{t("साइट के नीचे", "At the bottom of the site")}</p>
          <p className={styles.hintBody}>
            {t(
              "मिली-जुली खबरों की पट्टी और पूरे भारत व दुनिया के मौसम का विस्तारित पैनल भी मिलेगा।",
              "You will also find the mixed-headlines ticker and the full weather panel in the footer."
            )}
          </p>
          <Link href="#kn-site-footer" className={styles.hintLink}>
            {t("फ़ुटर पर जाएँ", "Jump to footer")}
          </Link>
        </div>
      </div>
    </section>
  );
}
