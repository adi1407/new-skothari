"use client";

type TFn = (hi: string, en: string) => string;

export default function ShowsStatsRow({ t }: { t: TFn }) {
  const stats = [
    { label: t("सब्सक्राइबर्स", "Subscribers"), value: "2.4M" },
    { label: t("वीडियो", "Videos"), value: "1,200+" },
    { label: t("व्यूज़", "Total Views"), value: "180M+" },
  ];
  return (
    <div className="shows-stats-row">
      {stats.map((s) => (
        <div key={s.label} className="shows-stat-card">
          <p className="shows-stat-value">{s.value}</p>
          <p className="shows-stat-label">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
