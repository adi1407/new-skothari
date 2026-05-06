import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "../../../data/mockData";
import { homeSections } from "../config/sections";
import { dek, headline } from "../server/homeFeed";
import styles from "../../../app/newsroom.module.css";

type HomeSection = (typeof homeSections)[number];

export default function HomeCategorySection({
  section,
  locale,
  lead,
  rest,
}: {
  section: HomeSection;
  locale: "hi" | "en";
  lead: NewsItem;
  rest: NewsItem[];
}) {
  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHead}>
        <h2 className="section-title">{locale === "hi" ? section.titleHi : section.title}</h2>
        <Link href={`/category/${section.slug}`} className="editors-all-btn">
          {locale === "hi" ? "और देखें" : "More"}
        </Link>
      </div>

      <div className={styles.storyLayout}>
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
}
