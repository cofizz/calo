# 🍃 Calo — Calorie Tracker

A private food & calorie diary for you and your friends. Each person signs up,
logs in, and gets their own diary that nobody else can see.

Built with **Next.js + TypeScript + Tailwind + Prisma (SQLite)**.

## Run it locally

```bash
npm run dev
```

Then open **http://localhost:3000** and create an account.

### Use it on your phone (same Wi-Fi)

When the dev server starts it prints a **Network** URL like
`http://192.168.x.x:3000`. Open that on your phone's browser (must be on the same
Wi-Fi), then use the browser menu → **Add to Home Screen** to make it feel like an app.

## Features

- Email + password accounts — each friend gets a private diary
- Log food with calories + protein / carbs / fat and a meal (breakfast, etc.)
- **🔍 Look up calories** — type "4 eggs" or "200g chicken" and it fills calories
  + macros automatically from a built-in food database (understands counts and
  portions; falls back to the USDA online database for anything not built in)
- **Your foods library** — save foods you eat often and re-add them in one tap
- **🧮 Goal calculator** — enter height / weight / age / sex / activity and pick
  Cut, Maintain, or Bulk; it computes your daily target (Mifflin-St Jeor). You
  can still set the goal manually.
- Daily calorie ring vs. your goal, plus macro totals
- Browse any day (‹ / ›)
- Delete entries with one tap

### Food lookup

The "Look up calories" button reads from a built-in food database in
[lib/foods-data.ts](lib/foods-data.ts) — no API key required. To add a food,
append an entry there (per-100g macros, plus the weight of "one" for countable
foods like eggs or slices).

For foods not in that list it falls back to the free **USDA FoodData Central**
API. That key is optional; get one at
<https://fdc.nal.usda.gov/api-key-signup.html> and set `USDA_API_KEY` in `.env`.

## How the data is stored

- A local SQLite file at `prisma/dev.db` (gitignored — it holds real user data).
- Edit data visually with `npm run db:studio`.
- Changing the schema? Edit `prisma/schema.prisma`, then
  `npx prisma migrate dev --name <change>`.

## Security (what's protecting it)

- **Passwords** are hashed with bcrypt — the plain password is never stored.
- **Sessions** are signed JWTs in an httpOnly + SameSite=Lax cookie, so page
  scripts can't read your login token.
- **Every input is validated** with Zod before hitting the database — junk like
  oversized numbers or wrong types is rejected.
- **SQL injection** isn't possible: Prisma uses parameterized queries.
- **XSS** is blocked: React escapes all text on render, plus a Content-Security
  -Policy header stops injected external scripts from running.
- **Data isolation**: every query is scoped to *your* user id (taken from the
  verified cookie, never the request body), so you can only ever read or delete
  your own entries.

## Going live (later)

To share beyond your Wi-Fi, deploy to Vercel (free):
1. Switch `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`.
2. Create a free Postgres DB (e.g. Neon) and set `DATABASE_URL` + `AUTH_SECRET`
   as environment variables in Vercel.
3. Push to GitHub and import the repo in Vercel.

> Generate a fresh `AUTH_SECRET` for production:
> `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
