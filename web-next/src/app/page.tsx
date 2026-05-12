import type { Metadata } from "next";
import HeroSection from "../components/HeroSection";
import NewsTicker from "../components/NewsTicker";
import HomeCategorySection from "../features/home/components/HomeCategorySection";
import { homeSections } from "../features/home/config/sections";
import { pickCategory, dek, headline } from "../features/home/server/homeFeed";
import { buildHomeWebSiteJsonLd } from "../features/home/seo/schema";
import { adaptArticles } from "../services/articleAdapter";
import { fetchPublicArticlesPage } from "../lib/serverPublicApi";
import InfinitePublicArticleList from "../components/InfinitePublicArticleList";
import HomeDiscoverRow from "../components/HomeDiscoverRow";
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
  const { articles: raw, total: feedTotal } = await fetchPublicArticlesPage({ limit: 120, locale });
  const feed = adaptArticles(raw);
  const seedIds = feed.map((a) => a.id);
  const jsonLd = buildHomeWebSiteJsonLd();

  return (
    <main className={styles.homeMain}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={`section-inner ${styles.sectionStack}`}>
        <HeroSection />
        <NewsTicker />
        <HomeDiscoverRow />
        {feed.length === 0 ? (
          <section className={styles.sectionBlock}>
            <p className="card-summary">
              {locale === "hi"
                ? "इस समय होम फ़ीड उपलब्ध नहीं है। कृपया कुछ देर बाद पुनः प्रयास करें।"
                : "Home feed is currently unavailable. Please try again shortly."}
            </p>
          </section>
        ) : null}
        {homeSections.map((section) => {
          const list = pickCategory(feed, section.slug, 6);
          if (!list.length) return null;
          const [lead, ...rest] = list;
          return <HomeCategorySection key={section.slug} section={section} locale={locale} lead={lead} rest={rest} />;
        })}
        <InfinitePublicArticleList
          locale={locale}
          seedIds={seedIds}
          total={feedTotal}
          headline={headline}
          dek={dek}
          sectionTitle={locale === "hi" ? "और खबरें" : "More stories"}
        />
      </div>
    </main>
  );
}
