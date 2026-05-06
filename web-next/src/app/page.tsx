import type { Metadata } from "next";
import HeroSection from "../components/HeroSection";
import NewsTicker from "../components/NewsTicker";
import HomeCategorySection from "../features/home/components/HomeCategorySection";
import { homeSections } from "../features/home/config/sections";
import { pickCategory } from "../features/home/server/homeFeed";
import { buildHomeWebSiteJsonLd } from "../features/home/seo/schema";
import { adaptArticles } from "../services/articleAdapter";
import { fetchPublicArticles } from "../lib/serverPublicApi";
import { getServerUiLang } from "../lib/serverLocale";
import { defaultDescription, siteName } from "../lib/seo/metadataHelpers";
import styles from "./newsroom.module.css";

export const metadata: Metadata = {
  title: siteName,
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: siteName,
    description: defaultDescription,
    url: "/",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
};

export default async function Home() {
  const locale = await getServerUiLang();
  const raw = await fetchPublicArticles({ limit: 120, locale });
  const feed = adaptArticles(raw);
  const jsonLd = buildHomeWebSiteJsonLd();

  return (
    <main className={styles.homeMain}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={`section-inner ${styles.sectionStack}`}>
        <HeroSection />
        <NewsTicker />
        {homeSections.map((section) => {
          const list = pickCategory(feed, section.slug, 6);
          if (!list.length) return null;
          const [lead, ...rest] = list;
          return <HomeCategorySection key={section.slug} section={section} locale={locale} lead={lead} rest={rest} />;
        })}
      </div>
    </main>
  );
}
