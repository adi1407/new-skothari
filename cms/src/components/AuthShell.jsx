export default function AuthShell({ children }) {
  return (
    <div className="cms-auth-root">
      <div className="cms-auth-bg" aria-hidden>
        <div className="cms-auth-bg-mesh" />
        <div className="cms-auth-bg-grid" />
        <div className="cms-auth-bg-vignette" />
      </div>
      <div className="cms-auth-inner">
        <div className="cms-auth-stack">{children}</div>
      </div>
    </div>
  );
}
