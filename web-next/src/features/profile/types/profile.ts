export type ProfileTabKey = "settings" | "saved" | "liked" | "privacy";

/** Matches `useNavigate()` from `src/lib/routerShim.tsx` */
export type ProfileNavigate = (to: string | number, options?: { replace?: boolean }) => void;

/** Reader API bookmark / upvote list rows (minimal shape for UI). */
export type ProfileReaderListRow = {
  _id: string;
  article?: { _id?: string; titleHi?: string; title?: string };
};
