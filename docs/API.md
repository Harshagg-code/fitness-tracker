# API Reference

Base path: `/api`. JSON in and out. Local default: `http://localhost:5001`.

**Auth.** Endpoints marked "Auth: yes" need `Authorization: Bearer <accessToken>`. Missing token returns `401` (empty body). Invalid or expired token returns `403` (empty body). Unhandled errors return `500 { "message": "Internal server error" }` unless noted.

## Auth (`/api/auth`)

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | no |
| POST | `/api/auth/login` | no |
| POST | `/api/auth/token` | no |
| DELETE | `/api/auth/logout` | no |

### POST /api/auth/register
Body: `{ "username": string, "email": string, "password": string }`
- `201 { "message": "User registered successfully" }`
- `400 { "message": "User already exists" }` (email taken)
- `500` on duplicate username (unique index; not handled specially) or any other error.

### POST /api/auth/login
Body: `{ "email": string, "password": string }`
- `200 { "accessToken": string, "refreshToken": string, "username": string }` (access token expires in 15 minutes; refresh token has no expiry)
- `401 { "message": "Invalid credentials" }`

### POST /api/auth/token
Body: `{ "token": <refreshToken> }`
- `200 { "accessToken": string }`
- `401` (no token), `403` (token not on any user, or fails verification)

### DELETE /api/auth/logout
Body: `{ "token": <refreshToken> }`
- `204` no content. Clears the stored refresh token for that user.

## Food search

### POST /api/nutrition
Auth: yes. Body: `{ "query": string }` (e.g. `"2 eggs and 1 cup rice"`). Proxies Calorie Ninjas.
- `200 [ { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number } ]`
- `400 { "error": "No foods found" }`

## Food log

### POST /api/logs
Auth: yes. Body: `{ name, calories, protein, carbs, fat, mealType? }` where `mealType` is `breakfast | lunch | snacks | dinner` (default `breakfast`).
- `201` the created log: `{ _id, userId, name, calories, protein, carbs, fat, mealType, createdAt, updatedAt }`

### GET /api/logs
Auth: yes. Today's logs (server local day, by `createdAt`).
- `200 { "logs": Log[], "grouped": { breakfast: Log[], lunch: Log[], snacks: Log[], dinner: Log[] }, "totalCalories": number }`

### DELETE /api/logs/:id
Auth: yes. `200 { "message": "Log deleted" }`. Note: deletes by id without checking the log belongs to the caller.

### GET /api/logs/week
Auth: yes. Last 7 days (today and 6 days back).
- `200 { "<YYYY-MM-DD>": { "logs": Log[], "totalCalories": number }, ... }`. Only days with logs appear. Date keys are UTC.

## Profile

### GET /api/profile
Auth: yes. `200` the user document without `password` and `refreshToken`: `{ _id, username, email, age?, height?, weight?, gender?, activityLevel?, calorieGoal?, goalWeight, createdAt, updatedAt }`.

### PUT /api/profile
Auth: yes. Body: `{ age: number, height: number (cm), weight: number (kg), gender: "male" | "female", activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active" }`.
- `200 { "user": <user without password/refreshToken>, "calorieGoal": number }`

## Saved meals

### GET /api/saved-meals
Auth: yes. `200 SavedMeal[]`, newest first. SavedMeal: `{ _id, userId, name, items: [{ name, calories, protein, carbs, fat }], totalCalories, totalProtein, totalCarbs, totalFat, createdAt, updatedAt }`.

### POST /api/saved-meals
Auth: yes. Body: `{ "name": string, "items": [{ name, calories, protein, carbs, fat }] }`. Totals are computed server-side.
- `201` the created SavedMeal

### DELETE /api/saved-meals/:id
Auth: yes. `200 { "message": "Meal deleted" }`. Does not check ownership.

## Water

### GET /api/water
Auth: yes. `200 { "glasses": number }` for today (UTC date). `0` if none.

### POST /api/water
Auth: yes. Body: `{ "glasses": number }`. Upserts today's record. `200 { "glasses": number }`.

## Weight

Weight documents: `{ _id, userId, weight, date, type: "start" | "daily", createdAt, updatedAt }`. The starting weight has `date: "start"`.

### POST /api/weight/start
Auth: yes. Body: `{ "weight": number }`. `200` the created document. `400 { "message": "Starting weight already set" }` if one exists.

### POST /api/weight
Auth: yes. Body: `{ "weight": number }`. Upserts today's `daily` entry. `200` the document.

### GET /api/weight/history
Auth: yes. `200 { "startingWeight": WeightDoc | null, "dailyLogs": WeightDoc[] }`. `dailyLogs` sorted by date ascending, limited to 30. Note: `.limit(30)` is applied after an ascending sort, so once more than 30 days exist this returns the 30 oldest, not the newest (unverified against a real dataset; follows from the query).

### DELETE /api/weight/reset
Auth: yes. Deletes all of the user's weight documents (start and daily). `200 { "message": "Weight history cleared" }`.

### POST /api/weight/goal
Auth: yes. Body: `{ "goalWeight": number }`. `200 { "goalWeight": number }`. Not used by the current frontend.

### GET /api/weight/goal
Auth: yes. `200 { "goalWeight": number | null }`. Not used by the current frontend.

## AI coach

### POST /api/ai/advice
Auth: yes. Body: `{ "messages": [{ "role": "user" | "assistant", "content": string }] }`. The server prepends a system prompt built from the user's profile and today's food totals (see CLAUDE.md).
- `200 { "reply": string }` (markdown text)
- `500 { "message": "Internal server error" }`
