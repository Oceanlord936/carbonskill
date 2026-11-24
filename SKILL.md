---
name: carbon-clean-layout
description: Make an IBM Carbon (@carbon/react) web page look clean and calm, the way Ocean likes it. Use when building or fixing the LAYOUT, sizes, spacing, fonts, nav, hints, tables or chart details of a Carbon page (SiteWatch status page, site-rank, any new Carbon app), when Ocean says a page looks crowded / out of proportion / AI generated, or asks to fine tune sizes with + / - knobs.
---

# Carbon clean layout

Patterns that worked on the SiteWatch status page (2026-11-23). Ocean's own words in quotes.

## How to work (the most important part)

- **The slow way.** One small change on the REAL page, Ocean looks, keep or undo. Never a separate mock page,
  never a new component library ("this is exactly the ai generated garbage I want to avoid"). Fix the existing.
- **Show first, code after** for anything with wording (hints, labels, explanations): list the text in chat, Ocean edits it.
- **Measure, don't guess.** When Ocean says "no change", check what the browser really renders with headless Chrome
  (`scripts/measure.mjs` in this skill) before touching more CSS. A screenshot (`chrome --headless=new --screenshot`) settles looks.
- **Let Ocean pick sizes by eye** with the knob box (below), then write the numbers in.

## Sizes: ratios, never fixed pixels ("use ratio never hardcode the pixel")

- Widths are `fr`, `%` or `vw`. Spacing uses Carbon tokens / rem. Never invent a px width.
- Page base size as a ratio: `html:root { font-size: 90%; }` — Carbon sizes everything in rem, so the whole page
  scales like a browser zoom. Media query rem stays the browser default, so breakpoints don't move.
- **One variable drives a group.** Nav example:
  ```css
  :root {
    --nav-icon: calc(1rem * 1.5);     /* icon = a ratio of Carbon's 1rem icon */
    --nav-rail: 4vw;                  /* closed nav */
    --nav-open: 16vw;                 /* open nav */
    --header-height: var(--nav-rail); /* top bar as tall as the rail is wide: the ☰ corner is a square */
  }
  ```
  Everything else (row height, page offset, ☰ button, nav top edge, overlay) is calculated from these.

## The clean layout (Windows Security + carbondesignsystem.com)

- **White top bar and white side nav on the grey page** (`background-color: var(--cds-layer-01)`); the colours
  separate them, no extra lines.
- **Carbon SideNav as a rail** (icons only) + `HeaderMenuButton` (☰, `isCollapsible`) to show labels. Drawn ONCE around
  every view. `addMouseListeners={false}` (no opening on hover). Icons centred:
  `padding-inline-start: calc((var(--nav-rail) - var(--nav-icon)) / 2)`. Open nav: item grey stops short of the right edge
  (`margin-inline-end` on the item, only when expanded). Icons + labels in `--cds-text-primary` black.
- **Each view = title on top, then main | hints**: `grid-template-columns: minmax(0, 72fr) minmax(0, 28fr)`; the title spans both.
  Below Carbon lg (66rem) one column, hints under the cards.
- **Hints column** = small cards that tell plain users what they can click. Rules: named like the card/button they explain,
  one short line, plain words, no dashes / hyphens, nothing that sounds alarming ("Is a website down?" was bad,
  "Check now" is good). Sticky on laptop: `position: sticky; inset-block-start: calc(var(--header-height) + 2rem)`.
- **Accordion cards stay** (all open); a chart's drill-down opens under the chart in the same card, wide tables in a **popup**
  (Carbon `Modal passiveModal size="lg"`). No side detail panels, no breadcrumbs (a Back STACK instead).
- **Back = a stack**: opening a view pushes `{view, site}`, Back pops, "Back to status" empties, a nav item starts a new stack.

## Type: 5 Carbon roles only (never write another font-size)

| Role | Carbon token | Size / line |
|---|---|---|
| Page title | heading-05 | 2rem / 2.5rem |
| Card title (tiles, hint cards, accordions) | heading-03 | 1.25rem / 1.75rem |
| Lead sentence | body-02 | 1rem / 1.5rem |
| Secondary text (grey) | body-01 | 0.875rem / 1.25rem |
| Small label (grey) | label-01 | 0.75rem / 1rem |

All regular weight. Define them once as CSS variables on the page's root class and only use those.

## Tables and info icons

- **ⓘ (Toggletip) only in a table HEADER, never inside a row.** What a column's values mean goes in that header's ⓘ,
  as a few short lines. An ⓘ near the right edge opens to the left (`align="bottom-end"`) or the table clips it.
- **Plain words, never raw codes** for normal users: `Check 1`, `1st / 2nd` try, `200 OK`, `Address not found`,
  `No reply in time`, `Connection dropped`; column names `Lookup / Connect / Secure / Reply (ms)`, not DNS / TCP / TLS / TTFB.
- State changes ask for a **typed Yes** in a Carbon `Modal` (`primaryButtonDisabled` until "yes"). Easy undo (Reopen) is one click.
- A button without an icon: centre its text (`justify-content: center; padding-inline: 1rem`), Carbon keeps icon space otherwise.

## Charts with many clickable marks

- Show it is clickable without hover (touch screens): a small label under each mark — but **only for marks that need
  attention** (unstable / offline), in grey; green marks get a `<title>` (name on hover). On hover the mark grows
  (`transform: scale(1.5)` on a wrapper `g` with `transform-box: fill-box; transform-origin: center`) and the label turns link blue.
- Marks too close (two events minutes apart) overlap: spread them in each row to a minimum gap (keep the real time for the popup).

## No blue focus frame after a mouse click (keyboard keeps it)

```scss
:focus:not(:focus-visible) { outline: none !important; box-shadow: none !important; }
.cds--header__action:focus:not(:focus-visible),
.cds--btn:not(.cds--btn--tertiary):focus:not(:focus-visible) { border-color: transparent !important; }
```

## Carbon CSS pitfalls (each cost an hour once)

- **Equal specificity → the later stylesheet wins**, and Carbon's may load after yours. Prefix your override with the
  parent Carbon class (`.cds--side-nav .cds--side-nav__icon > svg`).
- **A flex item shrinks into its box**: making an icon bigger needs the wrapper box bigger too (`flex: 0 0 X`) and `flex-shrink: 0`.
- **Width alone doesn't grow an SVG icon** (`preserveAspectRatio meet` centres it): set width AND height.
- **`overflow-x: hidden` on html/body breaks `position: sticky`** → use `overflow-x: clip`.
- **Carbon's SideNav item list stretches to the bottom**; a line on it is full height unless `flex: 0 0 auto`.
- **Dev CSS caching**: the chunk name doesn't change; DevTools → Network → Disable cache, or a new tab.
- `carbon.scss` changes need `npm run carbon:css` (only runs on predev / prebuild).

## The knob box: fine tune by eye, then write the numbers

`references/LayoutKnobs.tsx` is a dev-only box at the bottom centre with `− value +` per knob and the live number.
Each knob sets a CSS variable on `<html>`, so the page changes instantly. Workflow:

1. Make every tunable size a CSS variable (or `var(--x, default)`), as above.
2. Add a knob per variable (1 % per click; icons 10 % because 1 % of an icon is invisible). Start at the current values.
3. Show it behind a flag: `const SHOW_LAYOUT_KNOBS = false;` and `{SHOW_LAYOUT_KNOBS && process.env.NODE_ENV !== "production" && <LayoutKnobs />}`.
4. Ocean clicks until it looks right, sends a screenshot of the box, then write the numbers into the CSS and set the flag back to false
   (keep the component for the next page).

## Measuring in real Chrome

`scripts/measure.mjs` starts headless Chrome with the DevTools Protocol, opens a page, can click things, and returns
`getBoundingClientRect` / `getComputedStyle` numbers as JSON. Edit the `EXPRESSION` at the top for what to measure.
`node measure.mjs http://localhost:3000/ <scratch-profile-dir>`
