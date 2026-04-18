---
applyTo: "_sass/**/*.scss"
---

# SCSS Conventions

## Token usage

All colors, spacing, typography, and radii come from CSS variables in `_sass/_tokens.scss`. Never use raw hex values or hardcoded pixel values that duplicate a token.

Key tokens:
- Colors: `--brand-green`, `--brand-yellow`, `--brand-black`, `--brand-white`, `--brand-surface`, `--brand-muted`, `--brand-border`
- Spacing: `--sp-1` through `--sp-8`
- Text sizes: `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`
- Radii: `--r-sm`, `--r-md`, `--r-lg`
- Font: `--font-sans`, `--font-mono`

## Code block rules (critical)

`pre` must always pair background and color together:

```scss
// Correct
pre {
  background: var(--brand-black);
  color: var(--brand-white);
}
pre code {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}

// Wrong — causes invisible text
pre {
  background: var(--brand-surface); // light bg + inherited white text = invisible
}
```

## Specificity

- More specific selectors (`.post-body pre`) override base selectors (`pre`)
- When overriding `background` on a `pre`, always also set `color` explicitly
- When overriding `background` on `pre code`, reset to `background: none; color: inherit`

## Structure

Files: `_tokens.scss`, `_base.scss`, `_layout.scss`, `_components.scss`, `_pages.scss`
- `_tokens.scss` — variables only, no rules
- `_base.scss` — element-level defaults
- `_components.scss` — reusable UI components (`.btn`, `.card`, `.tag`)
- `_pages.scss` — page-specific overrides
