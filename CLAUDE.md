# Fitness Tracker

MERN fitness/nutrition tracker. Users register, set a profile (calorie goal is computed with Harris-Benedict), search foods in natural language (Calorie Ninjas), log them into four meals, track water and weight, view a weekly overview, and chat with an AI nutrition coach (Anthropic).

## Stack (versions from installed node_modules)

- Frontend: React 19.1, Vite 7.1, Tailwind CSS 4.2 (`@tailwindcss/vite`), DaisyUI 5.5, React Router 7.9, Recharts 3.8, axios 1.12, lucide-react 0.577, react-hot-toast, react-markdown
- Backend: Node (ESM, `"type": "module"`), Express 5.1, Mongoose 8.18 (MongoDB Atlas), jsonwebtoken, bcrypt 6, `@anthropic-ai/sdk` 0.78, axios (Calorie Ninjas), nodemon (dev)
- Deploy (from git history): backend on Render, frontend on Vercel

## Structure

```
backend/
  src/server.js        Express app, CORS, route mounting, connectDB then listen
  src/config/db.js     Mongoose connect (exits process on failure)
  src/routes/          One file per resource, all mounted under /api
  src/controllers/     Request handlers (auth, food, foodLog, profile, savedMeal, water, weight, ai)
  src/models/          Mongoose schemas (user, foodLog, savedMeal, waterLog, weight, food[unused])
  src/middleware/authMiddleware.js   authenticateToken (Bearer JWT)
  src/services/nutritionService.js   Dead code (Nutritionix), not imported anywhere
frontend/vite-project/
  index.html           Sets data-theme="caramellatte"
  src/main.jsx         BrowserRouter + Toaster
  src/App.jsx          Routes, ProtectedRoute, AuthProvider
  src/context/AuthContext.jsx   register/login/logout/refreshAccessToken, token state
  src/pages/           Home, Login, Register, Profile, Weekly, Meals
  src/index.css        Tailwind + DaisyUI plugin config
docs/                  API.md, DESIGN.md
```

Note: `frontend/` has a stray `package-lock.json`; the real app is `frontend/vite-project/`.

## Commands

```
# Backend (from backend/)
npm install
npm run dev        # nodemon src/server.js (port from PORT, default 5001)
npm start          # node src/server.js

# Frontend (from frontend/vite-project/)
npm install
npm run dev        # Vite dev server, http://localhost:5173
npm run build
npm run lint       # eslint .
npm run preview
```

No test suite exists (unverified for tests elsewhere; none found).

## Architecture

**Auth.** `POST /api/auth/login` returns `{ accessToken, refreshToken, username }`. Access token: JWT, 15 min, signed with `ACCESS_TOKEN_SECRET`. Refresh token: JWT with no expiry, signed with `REFRESH_TOKEN_SECRET`, stored on the user document and in `localStorage` (`refreshToken`). `POST /api/auth/token` swaps a valid refresh token for a new access token. `DELETE /api/auth/logout` clears it. `authenticateToken` reads `Authorization: Bearer <token>`: missing token gives 401, invalid or expired gives 403.

**Frontend auth state.** `AuthContext` holds `user` (username string) and `accessToken` in memory only. Reloading the page logs the user out, because nothing restores the session from the stored refresh token (it is stored but never used on load). `ProtectedRoute` in App.jsx redirects to `/login` when `user` is null.

**API calls.** Base URL comes from `src/api.js` (`VITE_API_URL`; set it in Vercel for production). Each page builds its own `getAuthHeaders()` and calls axios directly with full URLs. Only HomePage `handleSearch` retries once on 403 via `refreshAccessToken()`. All other calls do not refresh.

**Calorie goal.** `PUT /api/profile` computes `calorieGoal` with Harris-Benedict plus an activity multiplier and stores it on the user.

**AI coach.** `POST /api/ai/advice` loads the user (minus password and refreshToken) and today's `FoodLog` entries, sums calories/protein/carbs/fat, and builds a system prompt with profile fields, foods eaten and totals. The client's `messages` array is passed through unchanged. Model: `claude-sonnet-4-6`, `max_tokens` 1024. WeeklyPage reuses this endpoint by sending a weekly summary as a user message.

**Dates.** Food logs use `createdAt` ranges (server local time for "today"). Water and weight use `YYYY-MM-DD` strings from `toISOString()` (UTC), so day boundaries can differ between them.

## Conventions

- DaisyUI classes (`card`, `btn`, `input`, `navbar`, `badge`, `progress`) plus Tailwind utilities. Inline styles exist today only for SVG rings and fixed sizes; do not add more.
- Icons: lucide-react only.
- No emojis in the UI (some currently exist; see docs/DESIGN.md).
- Frontend files use 4-space indent, no semicolons, double quotes, default-exported function components, hooks at top, `useEffect` fetch on mount.
- Backend: ESM imports with `.js` extension, one exported handler per route, `try/catch` returning `res.status(500).json({ message: "Internal server error" })`.
- Toasts: `react-hot-toast`. `toast.success` on success, `toast.error("Failed to ...")` in `catch`. Fetch-on-load errors use `console.error` only.

## Gotchas (verified)

- Tailwind v4 uses the `@tailwindcss/vite` plugin in vite.config.js. `postcss.config.js` and `tailwind.config.js` do not exist and must not be added.
- The custom DaisyUI theme `fitness` is defined in `index.css` (`@plugin "daisyui/theme"`, `default: true`) and referenced by `data-theme` in `index.html` and the wrapper div in `App.jsx`. Keep the name in sync.
- The Anthropic client is created inside the handler in aiController.js so `process.env` is populated after `dotenv.config()` runs.
- `GET /api/weight/history` returns `{ startingWeight, dailyLogs }` (not an array). Frontend must fall back to `[]` / `null` (`res.data.dailyLogs || []`). WeeklyPage does; HomePage does for `dailyLogs`.
- Weight docs have `type` `"start"` or `"daily"`. The starting weight has `date: "start"`, which is not a real date: never pass it to `new Date()`.
- Render supplies `PORT`. CORS in server.js allows `http://localhost:5173`, one specific Vercel URL, and any `*.vercel.app`. Avoid double slashes in API URLs.
- Express 5 is in use: wildcard route syntax differs from Express 4.

## Don't

- Don't commit secrets or read/print `.env` values. `.env` is in the root `.gitignore` (covers `backend/.env` and `frontend/vite-project/.env`).
- Don't hardcode API URLs. Import `API_URL` from `src/api.js` (reads `VITE_API_URL`, falls back to `http://localhost:5001`, no trailing slash) and build URLs as `` `${API_URL}/api/...` ``.
- Don't change the DaisyUI theme in only one place.
- Don't add sleep, steps or heart-rate features; the app tracks calories, macros, water, weight and meals only.
- Don't import `services/nutritionService.js` or `models/foodModel.js` (legacy).

## Known problems (not yet fixed)

- Registration returns 500 on a duplicate username (only email is checked).
- `deleteLog` and `deleteSavedMeal` do not check `userId` ownership.
