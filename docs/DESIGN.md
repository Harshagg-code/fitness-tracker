# Design System (current state)

Everything here is read from the code as it exists today.

## Theme

- Theme: custom DaisyUI theme **`fitness`** (light, default), defined in `src/index.css` with `@plugin "daisyui/theme"`. Built-in themes are disabled (`themes: false`). `data-theme="fitness"` is set in `index.html` and in the wrapper div in `App.jsx`; keep both in sync with the theme name.
- The previous theme was the built-in `caramellatte`; the old commented-out "themeone" block was removed.
- Visual base: `docs/reference/dashboard3.png` (light grey page, white rounded cards, lime accent, pill tabs). From dashboard1: Consumed/Remaining tiles, macro analysis table, weekly bar chart with one highlighted bar. From dashboard2: one dark card per page, segmented water bar, semicircle calorie gauge.
- `App.css` is leftover Vite template CSS and is not imported anywhere in `src/` (verified with grep).

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

## Legacy (pre-redesign) details

The sections below describe the app before the redesign and are being replaced page by page. Homepage was redesigned first; Weekly, Meals, Profile, Login and Register still use the old layout (with `text-primary` swapped to `text-base-content` so lime does not appear as text).

## Borders, radius, shadow, type

- Cards: `card bg-base-100 shadow-sm`, no border. Login/Register cards use `shadow-lg`, chat panel `shadow-2xl`.
- Inner tiles: `bg-base-200 rounded-xl p-2/p-3 text-center` (MealsPage create form totals use `bg-base-300`).
- Inputs: `input input-bordered`, small variant `input-sm`. Icon inputs wrap the `<input class="grow">` in `<label class="input input-bordered flex items-center gap-2">`.
- Chat bubbles `rounded-2xl` with one squared corner.
- Section headings: `text-sm uppercase tracking-widest text-base-content/50 font-bold`. Field labels: `text-xs uppercase tracking-widest text-base-content/50`.
- Page titles `text-2xl font-bold`; brand `text-xl font-bold text-primary`. Secondary text uses `text-base-content/30` to `/60`.
- Macro text colors: protein `text-success`, carbs `text-warning`, fat `text-error`.

## Shared page chrome

- Page root `min-h-screen bg-base-200`.
- Navbar: `navbar bg-base-100 shadow-sm sticky top-0 z-50 px-6`. Home/Weekly/Meals use leaf icon + title on `navbar-start`, actions on `navbar-end`. Profile uses a Back button plus title.
- Content wrapper: `max-w-6xl` (Home, Weekly), `max-w-4xl` (Meals), `max-w-md` (Profile), all `mx-auto px-4 py-8 flex flex-col gap-6`.
- Toasts via `<Toaster />` default styling.
- Navigation is buttons calling `navigate()`; there is no shared Navbar component (it is copy-pasted per page).

## Pages

- **Login / Register**: centered column (`max-w-md`), leaf logo in a `bg-primary/10 rounded-2xl` square, title, one card with labelled icon inputs, primary button, divider, link to the other page.
- **Home (`/`)**: Navbar (Weekly, My Profile, My Meals, Logout). Full-width card with tabs (Search Food / My Meals) holding the search input or saved-meal list. Search results grid (1/2/3 columns) of cards with an add-to-meal picker. Then a two-column grid (`lg:grid-cols-2`): left is Today's Log (four collapsible meal cards with times); right stacks Daily Calories (progress bar + three macro tiles), Nutrition Breakdown (three SVG rings, shown only when logs exist and a goal is set), Water Intake, Weight Tracker. Floating chat widget bottom-right (60px circle button, 360x500 panel).
- **Weekly (`/weekly`)**: title, 4 stat cards (Days Tracked, Avg Calories, Goal Met, Best Day), two-column charts (calorie bar chart, weight line chart), Daily Breakdown progress rows, AI Weekly Report card with markdown output.
- **Profile (`/profile`)**: form card (age, height, weight, gender, activity level), then a result card with the large calorie number and three tiles (Lose = goal - 500, Maintain, Gain = goal + 500).
- **Meals (`/meals`)**: header with New Meal button, create-meal card (name, food search, results, items, 4 total tiles, save), list of saved-meal cards with macro tiles and item list.

## Reusable patterns

- **Card**: `card bg-base-100 shadow-sm` > `card-body` (often `py-3/py-4 px-5` for compact).
- **Stat tile**: small `bg-base-200 rounded-xl` box with a muted label above a bold value (Home macros, Profile goals, Meals macros). Weekly stat cards are full cards with an uppercase label and `text-lg font-bold` value.
- **SVG ring**: `<svg>` rotated -90deg with a track circle (`stroke="currentColor"`, `text-base-200`) and a progress circle using `strokeDasharray`, `strokeLinecap="round"`, `strokeWidth` 10; percent text centered with an absolutely positioned div. Used for macros (r=40, 100px) and water (r=36, 90px). Ring code is duplicated inline.
- **Meal section**: card with header row (label, time window, kcal, collapse arrow), then rows of food name + macros + remove icon button, or an empty-state line.
- **Add-to-meal picker**: inline 2x2 grid of `btn-xs btn-outline btn-primary` for breakfast/lunch/snacks/dinner plus Cancel.
- **Progress bar**: DaisyUI `progress` with `progress-success` (<75%), `progress-warning` (>=75%), `progress-error` (>=100%).
- **Charts (Recharts)**: `ResponsiveContainer` height 220; calorie `BarChart` (barSize 32, hidden YAxis, custom bar shape with `rx=4`, dashed `ReferenceLine` at goal); weight `LineChart` (monotone, strokeWidth 2, dots r=4, last 7 entries).
- **Chat widget**: fixed-position container (inline styles), header `bg-primary text-primary-content`, scrolling message list, suggestion buttons, input + send. Replies rendered with `react-markdown`.
- **Buttons**: `btn btn-primary`, `btn-outline`, `btn-ghost`, sizes `btn-sm`/`btn-xs`; destructive `btn-error btn-outline`; loading state via a `loading` class (DaisyUI 5 may not style `.btn.loading`; unverified).

## Known deviations from the stated conventions

- Emojis in UI: a party emoji in the water goal text (HomePage); text arrows and triangles (`→`, `▼`, `▲`, `↓`, `↑`) are used as glyphs.
- Inline styles: SVG rings, chat widget, water button color.
- The AI system prompt tells the model to "use emojis occasionally", so chat replies may contain emojis.

## Redesign direction

Reference dashboards: bento-style cards, a row of stat tiles on top, a calorie gauge, a macro breakdown table, a weekly bar chart with one highlighted bar. Use only data the app already tracks (calories, macros, water, weight, meals). Do not add widgets for sleep, steps, or heart rate.
