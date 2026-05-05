# Hooks Organization

Use `src/hooks` only for cross-feature hooks.

Examples:

- `useDebounce`
- `useMediaQuery`
- `useMounted`
- `useIsomorphicLayoutEffect`

Feature-specific hooks should live with the feature:

- `src/features/article/hooks/*`
- `src/features/profile/hooks/*`

Do not place SEO metadata logic in hooks. SEO stays in `src/app` and `src/lib/seo`.
