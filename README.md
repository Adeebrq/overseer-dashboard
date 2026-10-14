# Overseer

Overseer is an agent-operations dashboard built pixel-for-pixel from the Figma exports in [`design/`](design) (dark and light),
with React 18, TypeScript and Vite. Plain CSS, no UI framework.

## Scripts

| Command           | What it does                                               |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | Dev server on http://localhost:5174                        |
| `npm run build`   | Type-check, then production build to `dist/`               |
| `npm run preview` | Serve the production build                                 |
| `npm run check`   | Everything CI should run: types, lint, formatting, tests   |
| `npm test`        | Unit tests (Vitest); `npm run test:watch` while developing |
| `npm run lint`    | ESLint (TypeScript + React Hooks rules)                    |
| `npm run format`  | Prettier                                                   |

## Project structure

```
src/
  main.tsx, App.tsx       entry + app shell (routing, theme, drawer state)
  components/             shared UI: Dropdown, DotCanvas, DotBar, Trend, Toaster, icons
  features/
    shell/                sidebar, top bar, search, account menu, nav glow, placeholder pages
    overview/             KPI strip, inference chart, regional map, agent table (+ filter, export)
  lib/                    app infrastructure: router, theme, toasts, load intro, formatting
    hooks/                usePopover, useListNavigation, useDesignBox
  data/                   mock data (numbers, not display strings), status labels, map dots
  styles/                 one file per area, imported in cascade order by index.css
  fonts/, assets/
design/                   Figma exports + measuring script (dev only, never bundled)
```

Pure logic (export formats, filters, formatting, dot-bar pattern, intro timing) lives in plain `.ts` modules
next to the feature that uses it, and has unit tests alongside (`*.test.ts`).

## How the design fidelity works

- **Design pixels → rem.** CSS is written in pixels from the 1280×832 Figma frame; a small PostCSS step in
  `vite.config.ts` converts them to rem. On desktop the root font-size scales with whichever of width or height
  is tighter, so the whole dashboard fits the window like the frame does. Tablet/phone use a normal scrolling
  layout.
- **Fonts** are the ones the design uses: Geist, Geist Mono and Departure Mono (pixel numbers).
- **Geometry from the export.** Icons, map dots and the chart line are copied from the SVGs, not redrawn.
- **Checking.** In dev, add `?overlay` (or press `o`) to lay the export for the current theme over the page;
  `?overlay=diff` highlights anything misaligned. `design/measure.js` compares text and boxes numerically.

## Theming

Dark is the base theme. Light mode is a single override block (`styles/21-theme-light.css`) using values taken
from `design/light.svg`; the switch is in the account menu (`lib/theme.ts`). The choice is saved in
`localStorage` and otherwise follows the system setting; `index.html` applies it before first paint.

Canvas-drawn dots read their colours from CSS variables, so they follow the theme too.

## Notes

- Data in `src/data/mock.ts` is placeholder. Monthly/Weekly chart figures were invented to make the range
  dropdown meaningful.
- Pages other than Overview show a "Coming soon" screen; sign-out is a mock.
- Toasts: `toast({ title, description })` from `lib/toast.ts` works anywhere.
