# Design System (current state)

Everything here is read from the code as it exists today.

## Theme

- Theme: custom DaisyUI theme **`fitness`** (light, default), defined in `src/index.css` with `@plugin "daisyui/theme"`. Built-in themes are disabled (`themes: false`). `data-theme="fitness"` is set in `index.html` and in the wrapper div in `App.jsx`; keep both in sync with the theme name.
- The previous theme was the built-in `caramellatte`; the old commented-out "themeone" block was removed.
- Visual base: `docs/reference/dashboard3.png` (light grey page, white rounded cards, lime accent, pill tabs). From dashboard1: Consumed/Remaining tiles, macro analysis table, weekly bar chart with one highlighted bar. From dashboard2: one dark card per page, segmented water bar, semicircle calorie gauge.
- `App.css` is leftover Vite template CSS, not imported anywhere.

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| base-100 | #FFFFFF | Cards |
| base-200 | #EDEDED | Page background, inner tiles |
| base-300 | #DCDCDC | Tracks, dividers |
| base-content | #111111 | All text |
| primary / content | #D4F04A / #111111 | Lime. Fills, active pill, buttons. Never as text on white |
| secondary | #EDEDED / #111111 | Quiet buttons |
| accent | #D4F04A / #111111 | Same as primary |
| neutral / content | #111111 / #FFFFFF | The one dark card per page |
| info | #3B82F6 / #FFFFFF | |
| success | #3FA66B / #FFFFFF | Under goal |
| warning | #F5A524 / #111111 | Fat macro, approaching goal |
| error | #FF4B3E / #FFFFFF | Over goal, destructive |

Shape tokens: radius-box 1.25rem (cards), radius-field 0.75rem (inputs, buttons, inner tiles), radius-selector 9999px (pills, toggles), border 1px, depth 0, noise 0.

Macro colors: protein = primary (lime), carbs = neutral (black), fat = warning (amber). Red is reserved for over-goal and destructive actions.

## Layout rules (new design)

- Page: `min-h-screen bg-base-200`; content `max-w-7xl mx-auto px-4 md:px-6`; grid gap `gap-4`.
- Card: `card bg-base-100 rounded-box`, body padding `p-5`, no border, no shadow.
- Inner tile: `bg-base-200 rounded-field p-3`.
- Type scale: card title `text-base font-semibold`; big value `text-3xl font-bold`; label `text-xs text-base-content/60`; body `text-sm`.
- At most one dark card (`bg-neutral text-neutral-content`) per page.
- No emojis; lucide-react icons only; inline styles only for SVG geometry.

## Pages

All pages share `Navbar` (pill tabs Home / Weekly / Meals / Profile, user chip, Logout) and `max-w-7xl` content, except Login/Register (centered `max-w-md`).

- **Home**: greeting, four stat tiles, calorie gauge + Calories Analysis table, search/My Meals card with four collapsible meal cards, dark Water card, Weight card, floating chat.
- **Weekly**: four summary tiles, the dark calories chart (today's bar lime, dashed lime goal line), weight trend card, daily breakdown card, AI report card.
- **Meals**: header, create-meal card, empty state, saved-meal cards with macro chips.
- **Profile**: details form card and maintenance calorie card with Lose / Maintain / Gain tiles.
- **Login / Register**: logo, title, one card, lime primary button, link to the other page.

## Components (`src/components/`)

`Navbar`, `Card` (title/action shell), `StatTile`, `MacroChips`, `FormField`, `AuthLayout`; Home-only in `home/`: `CalorieGauge`, `MacroTable`, `FoodSearchCard`, `AddToMealPicker`, `MealSection`, `WaterCard`, `WeightCard`, `ChatWidget`.

Dark cards: Home = Water, Weekly = calories chart. No other page has one.

Chart colors are hex strings because Recharts needs them: lime `#D4F04A`, black `#111111`, red `#FF4B3E`, muted `#A3A3A3` / `#6B6B6B`.

## Redesign direction

Reference dashboards: bento-style cards, a row of stat tiles on top, a calorie gauge, a macro breakdown table, a weekly bar chart with one highlighted bar. Use only data the app already tracks (calories, macros, water, weight, meals). Do not add widgets for sleep, steps, or heart rate.
