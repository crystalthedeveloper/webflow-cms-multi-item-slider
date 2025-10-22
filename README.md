# Webflow CMS Multi-Item Slider (CLTD Edition)

A lightweight enhancer for Webflow’s native slider that groups Collection items into slides automatically. Configuration happens entirely through attributes, so designers never need to hand-build grids or wrappers.

## Features
- Uses `data-cltd-items-per-slide` to control grouping (defaults to 1; auto-drops to 1 item on screens ≤ 767px).
- Rebuilds the existing slider structure so Webflow arrows, dots, swipe, and autoplay keep working.
- Adds `.cltd-slide-group` plus numbered modifiers like `.cltd-slide-group-1` for optional per-slide styling.
- Supports inline layout controls via attributes—gap, grid, flexbox, and alignment—no custom CSS required.
- Hides native navigation UI when only one slide remains after grouping.

## Setup
1. Include the script just before the closing `</body>` tag:
   ```html
   <script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/webflow-cms-multi-item-slider@latest/cms-multi-item-slider.js" defer></script>
   ```
2. In Webflow Designer configure your slider elements:
   - Slider wrapper → `data-cltd-slider="cms"`
   - Slider mask → `data-cltd-slider-mask`
   - Collection List wrapper (the element with `.w-dyn-list`) → `data-cltd-items-per-slide="3"` (change `3` to whatever you need).
3. Publish or use Preview—the script runs on `DOMContentLoaded`, rebuilds the slides, and triggers Webflow’s slider redraw.

## Optional Attributes
Add these to the same Collection List wrapper (`data-cltd-items-per-slide` element) to tweak layout:

| Attribute | Example | Effect |
| --- | --- | --- |
| `data-cltd-slide-gap` | `2rem` | Controls both row & column gap for grid/flex layouts (default `1.5rem`). |
| `data-cltd-slide-column-gap` | `3rem` | Overrides horizontal gap. |
| `data-cltd-slide-row-gap` | `1rem` | Overrides vertical gap. |
| `data-cltd-layout` | `flex` | Switches from auto grid to flexbox (items wrap). |
| `data-cltd-align` | `center` | Aligns items (`left`, `center`, `right`). Works for grid/flex/block layouts. |
| `data-cltd-slide-single-layout` | `flex` | Set the display mode used when only one item is shown (default `block`). |

### Responsive Behaviour
- Desktop/tablet widths use the configured `data-cltd-items-per-slide` count.
- Screens ≤ 767 px automatically show one collection item per slide (no attribute required).
- The slider listens for window resize and rebuilds as breakpoints change.

## Styling Hooks
- Each generated group receives the base class `.cltd-slide-group` and a combo class `.cltd-slide-group-{n}`.
- Add custom CSS or Webflow Designer styles targeting those classes for additional decoration.
- Because the layout is applied inline by the script, additional CSS can override it if needed (`!important` rarely required).

## Notes
- The script keeps multiple `data-cltd-slider="cms"` instances independent on the same page.
- Navigation arrows/dots are hidden when only one slide is generated, preventing redundant UI.
- If you edit Collection item markup, ensure the `.w-dyn-item` elements remain direct descendants of the wrapper with `data-cltd-items-per-slide`.

Happy building! 💫
