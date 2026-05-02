import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroSection from "../components/HeroSection";
import NewsTicker from "../components/NewsTicker";
import { adaptArticles } from "../services/articleAdapter";
import { fetchPublicArticles } from "../lib/serverPublicApi";
import { getServerUiLang } from "../lib/serverLocale";
import type { NewsItem } from "../data/mockData";
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

function pickCategory<T extends { categorySlug: string }>(feed: T[], slug: string, max: number): T[] {
  return feed.filter((a) => a.categorySlug === slug).slice(0, max);
}

function headline(item: NewsItem, locale: "hi" | "en") {
  return locale === "hi" ? item.title || item.titleEn : item.titleEn || item.title;
}

function dek(item: NewsItem, locale: "hi" | "en") {
  return locale === "hi" ? item.summary || item.summaryEn : item.summaryEn || item.summary;
}

export default async function Home() {
  const locale = await getServerUiLang();
  const raw = await fetchPublicArticles({ limit: 120, locale });
  const feed = adaptArticles(raw);

  const sections = [
    { slug: "desh", title: "Country", titleHi: "देश" },
    { slug: "videsh", title: "World", titleHi: "विदेश" },
    { slug: "rajneeti", title: "Politics", titleHi: "राजनीति" },
    { slug: "khel", title: "Sports", titleHi: "खेल" },
    { slug: "health", title: "Health", titleHi: "स्वास्थ्य" },
    { slug: "krishi", title: "Agriculture", titleHi: "कृषि" },
    { slug: "business", title: "Business", titleHi: "व्यापार" },
    { slug: "manoranjan", title: "Entertainment", titleHi: "मनोरंजन" },
  ] as const;

  return (
    <main className={styles.homeMain}>
      <div className={`section-inner ${styles.sectionStack}`}>
        <HeroSection />
        <NewsTicker />
        {sections.map((section) => {
          const list = pickCategory(feed, section.slug, 6);
          if (!list.length) return null;
          const [lead, ...rest] = list;
          return (
            <section key={section.slug} className={styles.sectionBlock}>
              <div className={styles.sectionHead}>
                <h2 className="section-title">{locale === "hi" ? section.titleHi : section.title}</h2>
                <Link href={`/category/${section.slug}`} className="editors-all-btn">
                  {locale === "hi" ? "और देखें" : "More"}
                </Link>
              </div>

              <div className={styles.storyLayout}>
                {lead ? (
                  <article className={`card-default ${styles.leadCard}`}>
                    <Link href={`/article/${lead.id}`} className={styles.leadLink}>
                      <Image
                        src={lead.image}
                        alt={headline(lead, locale)}
                        width={800}
                        height={450}
                        className={styles.leadImage}
                      />
                      <div className={styles.leadTextWrap}>
                        <h3 className={styles.leadTitle}>{headline(lead, locale)}</h3>
                        <p className={styles.leadSummary}>{dek(lead, locale)}</p>
                      </div>
                    </Link>
                  </article>

                ) : null}

                <div className={styles.cardsGrid}>
                  {rest.map((item) => (
                    <article key={String(item.id)} className={`card-default ${styles.cardBody}`}>
                      <Link href={`/article/${item.id}`} className={styles.cardLink}>
                        <Image
                          src={item.image}
                          alt={headline(item, locale)}
                          width={800}
                          height={450}
                          className={styles.cardImage}
                        />
                        <h3 className="card-title">{headline(item, locale)}</h3>
                        <p className="card-summary">{dek(item, locale)}</p>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
