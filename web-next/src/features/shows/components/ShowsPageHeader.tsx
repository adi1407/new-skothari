"use client";

import BrandLogo from "../../../components/BrandLogo";
import { SITE_SOCIAL } from "../../../config/siteSocial";
import ShowsYtIcon from "./ShowsYtIcon";

type TFn = (hi: string, en: string) => string;

export default function ShowsPageHeader({ t }: { t: TFn }) {
  return (
    <div className="shows-page-header">
      <div className="shows-page-header-inner">
        <div className="shows-page-title-row">
          <BrandLogo className="shows-page-brand-logo" height={48} decorative />
          <div>
            <h1 className="shows-page-title">{t("शोज़", "Shows")}</h1>
            <p className="shows-page-sub">{t("हमारे YouTube चैनल पर देखें", "Watch on our YouTube channel")}</p>
          </div>
        </div>
        <a
          href={SITE_SOCIAL.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="shows-subscribe-btn"
        >
          <ShowsYtIcon size={16} />
          {t("सब्सक्राइब करें", "Subscribe")}
        </a>
      </div>
    </div>
  );
}
