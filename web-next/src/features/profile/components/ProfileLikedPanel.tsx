"use client";

import type { ProfileNavigate, ProfileReaderListRow } from "../types/profile";

type TFn = (hi: string, en: string) => string;

export default function ProfileLikedPanel({
  likedPosts,
  navigate,
  t,
}: {
  likedPosts: ProfileReaderListRow[];
  navigate: ProfileNavigate;
  t: TFn;
}) {
  return (
    <div className="profile-card">
      <h3 className="profile-h3">
        {t("पसंद किए गए लेख", "Liked posts")} ({likedPosts.length})
      </h3>
      {likedPosts.length === 0 ? (
        <div className="profile-empty">
          <p className="profile-sub">{t("अभी कोई पसंद किए गए लेख नहीं।", "No liked posts yet.")}</p>
          <button type="button" className="profile-btn ghost" onClick={() => navigate("/")}>
            {t("नवीनतम खबरें देखें", "Browse latest news")}
          </button>
        </div>
      ) : (
        likedPosts.map((row) => (
          <button
            key={row._id}
            type="button"
            className="profile-row profile-row-dense"
            onClick={() => {
              const a = row.article;
              const slug =
                a?.articleNumber != null && Number.isFinite(Number(a.articleNumber))
                  ? String(a.articleNumber)
                  : a?._id;
              if (slug) navigate(`/article/${slug}`);
            }}
          >
            <span className="profile-row-title">{row.article?.titleHi || row.article?.title || "Untitled"}</span>
          </button>
        ))
      )}
    </div>
  );
}
