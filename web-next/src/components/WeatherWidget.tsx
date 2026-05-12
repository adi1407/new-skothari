"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  ThermometerSun,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { WEATHER_LOCATIONS } from "../data/weatherLocations";
import { fetchOpenMeteoCurrent } from "../lib/openMeteo";
import styles from "./weather-widget.module.css";

function weatherIcon(code: number | undefined) {
  const c = code ?? 0;
  if (c === 0) return Sun;
  if (c <= 3) return c === 1 ? CloudSun : Cloud;
  if (c <= 48) return CloudFog;
  if (c <= 57) return CloudDrizzle;
  if (c <= 67) return CloudRain;
  if (c <= 77) return CloudSnow;
  if (c <= 82) return CloudRain;
  if (c >= 95) return CloudLightning;
  return CloudSun;
}

export default function WeatherWidget({ variant = "footer" }: { variant?: "footer" | "surface" }) {
  const { lang, t } = useLang();
  const defaultId = "in-dl";
  const [locId, setLocId] = useState(defaultId);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [temp, setTemp] = useState<number | null>(null);
  const [apparent, setApparent] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [code, setCode] = useState<number | undefined>();

  const loc = useMemo(() => WEATHER_LOCATIONS.find((l) => l.id === locId) ?? WEATHER_LOCATIONS[0], [locId]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setErr("");
    fetchOpenMeteoCurrent(loc.lat, loc.lon, ac.signal)
      .then((data) => {
        if (data.error) {
          setErr(t("मौसम लोड नहीं हो सका।", "Could not load weather."));
          setTemp(null);
          return;
        }
        const cur = data.current;
        if (cur?.temperature_2m == null) {
          setErr(t("डेटा उपलब्ध नहीं।", "No data available."));
          setTemp(null);
          return;
        }
        setTemp(cur.temperature_2m);
        setApparent(cur.apparent_temperature ?? null);
        setHumidity(cur.relative_humidity_2m ?? null);
        setCode(cur.weather_code);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setErr(t("नेटवर्क त्रुटि।", "Network error."));
        setTemp(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, [loc.lat, loc.lon, t]);

  const Icon = weatherIcon(code);
  const label = lang === "hi" ? loc.labelHi : loc.labelEn;
  const india = WEATHER_LOCATIONS.filter((l) => l.region === "india");
  const world = WEATHER_LOCATIONS.filter((l) => l.region === "world");
  const isSurface = variant === "surface";
  const iconColor = isSurface ? "var(--brand-red)" : "rgba(255,255,255,0.92)";

  return (
    <div className={`${styles.card} ${isSurface ? styles.cardSurface : ""}`}>
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <ThermometerSun size={18} strokeWidth={2.2} aria-hidden />
          {t("मौसम", "Weather")}
        </div>
        <select
          className={styles.select}
          value={locId}
          onChange={(e) => setLocId(e.target.value)}
          aria-label={t("स्थान चुनें", "Choose location")}
        >
          <optgroup label={lang === "hi" ? "भारत" : "India"}>
            {india.map((l) => (
              <option key={l.id} value={l.id}>
                {lang === "hi" ? l.labelHi : l.labelEn}
              </option>
            ))}
          </optgroup>
          <optgroup label={lang === "hi" ? "विदेश" : "World"}>
            {world.map((l) => (
              <option key={l.id} value={l.id}>
                {lang === "hi" ? l.labelHi : l.labelEn}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {loading ? <div className={styles.skeleton} aria-hidden /> : null}
      {!loading && err ? <p className={styles.err}>{err}</p> : null}
      {!loading && !err && temp != null ? (
        <div className={styles.body}>
          <Icon size={56} strokeWidth={1.6} color={iconColor} aria-hidden />
          <div>
            <div className={styles.tempBlock}>
              <span className={styles.tempMain}>{Math.round(temp)}°C</span>
              <span className={styles.tempSub}>{label}</span>
            </div>
            {(() => {
              const metaLine = [
                apparent != null
                  ? t(`अनुभव: ${Math.round(apparent)}°C`, `Feels like ${Math.round(apparent)}°C`)
                  : "",
                humidity != null ? t(`नमी ${humidity}%`, `${humidity}% humidity`) : "",
              ]
                .filter(Boolean)
                .join(" · ");
              return metaLine ? <p className={styles.meta}>{metaLine}</p> : null;
            })()}
          </div>
        </div>
      ) : null}

      <p className={styles.attr}>
        {t("डेटा स्रोत:", "Data:")}{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>
        {t(" (खुला डेटा, केवल संदर्भ)", " (open data; attribution only)")}
      </p>
    </div>
  );
}
