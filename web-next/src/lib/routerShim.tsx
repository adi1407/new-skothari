"use client";

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useEffect,
  useState,
  useLayoutEffect,
  type ReactElement,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";

type RouteProps = {
  path: string;
  element: ReactElement;
};

type LocationLike = {
  pathname: string;
  search: string;
  hash: string;
};

const ParamsContext = createContext<Record<string, string>>({});

function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  if (pattern === pathname) return {};
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const pp = patternParts[i];
    const vp = pathParts[i];
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = decodeURIComponent(vp);
      continue;
    }
    if (pp !== vp) return null;
  }
  return params;
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Route(_props: RouteProps) {
  return null;
}

/** Strip trailing slashes so route patterns match Next `usePathname()` reliably. */
export function normalizePathname(p: string): string {
  if (!p || p === "/") return "/";
  return p.replace(/\/+$/, "") || "/";
}

export function Routes({ children }: { children: ReactNode }) {
  const pathname = normalizePathname(usePathname() || "/");
  const routes = useMemo(() => {
    return Children.toArray(children).filter(
      (node): node is ReactElement<RouteProps> =>
        isValidElement(node) && typeof (node.props as RouteProps).path === "string"
    );
  }, [children]);

  for (const route of routes) {
    const params = matchPath(route.props.path, pathname);
    if (params) {
      return <ParamsContext.Provider value={params}>{route.props.element}</ParamsContext.Provider>;
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: "#555", marginBottom: 8 }}>
        No route matched <code style={{ wordBreak: "break-all" }}>{pathname}</code>.
      </p>
      <p style={{ color: "#555", fontSize: 14 }}>
        On your phone, open the dev URL using your PC LAN IP (for example{" "}
        <code style={{ wordBreak: "break-all" }}>http://192.168.1.10:3000</code>
        ), not <code>localhost</code>. The dev server is started with{" "}
        <code>npm run dev</code> so it listens on all interfaces.
      </p>
    </main>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useParams<T extends Record<string, string>>() {
  return useContext(ParamsContext) as T;
}

/**
 * Mirrors browser location without `useSearchParams()`.
 * `useSearchParams` opts the tree into Next.js client Suspense; an empty
 * `<Suspense fallback>` (see AppShell) then presents as a blank screen on
 * some devices until resolution — especially noticeable on mobile Safari.
 */
export function useLocation(): LocationLike {
  const pathname = normalizePathname(usePathname() || "/");
  const [tail, setTail] = useState({ search: "", hash: "" });

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    setTail({
      search: window.location.search || "",
      hash: window.location.hash || "",
    });
  }, [pathname]);

  return {
    pathname,
    search: tail.search,
    hash: tail.hash,
  };
}

type ShimLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  to: string;
};
export function Link({ to, ...props }: ShimLinkProps) {
  return <NextLink href={to} {...props} />;
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [replace, router, to]);
  return null;
}
