"use client";

type TFn = (hi: string, en: string) => string;

type ReaderLite = {
  name?: string;
  email?: string;
  avatar?: string;
  lastLogin?: string;
};

export default function ProfileHeader({
  isAuthenticated,
  reader,
  welcome,
  lastLoginLabel,
  onLogout,
  t,
}: {
  isAuthenticated: boolean;
  reader: ReaderLite | null;
  welcome: string;
  lastLoginLabel: string;
  onLogout: () => void;
  t: TFn;
}) {
  if (isAuthenticated && reader) {
    const avatarSrc = reader.avatar || "";
    return (
      <header className="profile-head profile-head-signedin">
        <div className="profile-identity">
          {avatarSrc ? (
            <img className="profile-avatar" src={avatarSrc} alt="" width={56} height={56} />
          ) : (
            <div className="profile-avatar profile-avatar-fallback" aria-hidden>
              {(reader.name || reader.email || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="profile-identity-text">
            <h1 className="profile-title">{welcome}</h1>
            {reader.email && <p className="profile-sub">{reader.email}</p>}
            {lastLoginLabel && <p className="profile-meta-line">{lastLoginLabel}</p>}
          </div>
        </div>
        <button type="button" className="profile-btn ghost profile-head-logout" onClick={onLogout}>
          {t("लॉग आउट", "Log out")}
        </button>
      </header>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="profile-head profile-head-signedin">
        <h1 className="profile-title">{welcome}</h1>
        <button type="button" className="profile-btn ghost profile-head-logout" onClick={onLogout}>
          {t("लॉग आउट", "Log out")}
        </button>
      </div>
    );
  }

  return (
    <div className="profile-head">
      <h1 className="profile-title">{welcome}</h1>
      {reader?.email && <p className="profile-sub">{reader.email}</p>}
    </div>
  );
}
