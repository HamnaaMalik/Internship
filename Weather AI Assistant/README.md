# Weather Hub

A live, multi-city weather dashboard — built with React + Vite + Express, with
an AI chat assistant. Dark night ocean theme. Default city is **Lahore,
Pakistan** — search any city worldwide.

## Features

- **Live weather data** — no API key needed. Powered by [Open-Meteo](https://open-meteo.com/) (current conditions, hourly, and 10-day forecast).
- **Two-panel layout**: "Today" (condition, big temperature, hourly strip, 5/10-day forecast) and "Map & Details" (embedded map, wind & pressure, precipitation windows, sunrise/sunset).
- **Search & save cities** — search any city worldwide, switch between saved locations, or use your device location.
- **°F / °C toggle**, with wind speed units switching automatically (mph / km/h).
- **AI weather assistant** (bottom-right chat) — answers questions like "will it rain today?", "what should I wear?", "what's the forecast this weekend?" straight from the live data. Uses Google Gemini if an API key is set, otherwise falls back to a rich built-in local answer engine.
- Fully responsive: two columns on desktop/laptop, tabbed single column on mobile.

## Project structure

```
├── src/main.jsx        React app (UI, weather fetching, chat widget)
├── src/styles.css       Dark ocean theme styling
├── lib/weatherAI.js     Shared AI logic (local answer engine + Gemini call) —
│                         used by BOTH server.js (local dev) and api/ai.js (Vercel)
├── server.js             Express server for local development (npm run dev)
├── api/ai.js             Vercel serverless function — production /api/ai
├── api/health.js         Vercel serverless function — production /api/health
```

---

## 🚀 Roz ka routine (Daily Cheat Sheet)

**Jab bhi project dobara kholna ho, bas ye 2 lines kaafi hain:**

```powershell
cd Weather-web
npm run dev
```

Terminal mein "Weather Hub running at http://localhost:5173" dikhte hi
browser mein us link ko khol lein. `npm install` roz nahi chalana — ye sirf
pehli dafa, ya jab koi naya package add ho, tab chalega.

---

## 📖 Har command ka matlab

| Command | Kab chalayein | Kya karta hai |
|---|---|---|
| `cd Weather-web` | Har baar | Us folder mein le jata hai jahan project hai |
| `npm install` | Sirf pehli dafa / naya package add hone par | `package.json` mein likhi saari libraries download karta hai (`node_modules` folder mein) |
| `npm run dev` | Har baar develop/test karte waqt | Local server start karta hai — `http://localhost:5173` pe app khul jati hai, live changes bhi turant dikhte hain |
| `npm run build` | Sirf test karna ho ke production build theek ban rahi hai | Website ka final "production version" `dist` folder mein banata hai, jaisa Vercel pe deploy hoga |
| `npm run preview` | `npm run build` ke baad, optional | Us production build ko locally chala kar dikhata hai |
| `git add .` | Jab bhi koi change GitHub pe bhejna ho | Saare changed files ko "staged" karta hai agle commit ke liye |
| `git commit -m "message"` | `git add .` ke turant baad | Un changes ko ek save-point (commit) mein lock karta hai |
| `git push` | `git commit` ke turant baad | GitHub pe changes bhej deta hai — Vercel khud-ba-khud naya version deploy kar deta hai |

---

## Optional: Gemini AI enable karna

Chat assistant bina kisi setup ke bhi kaam karta hai (built-in local answers
se). Agar Gemini se aur natural/smart replies chahiye:

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) se free
   API key banayein.
2. `.env.example` ko copy karke naam `.env` rakh dein.
3. Usme likhein:
   ```
   GEMINI_API_KEY=your-key-here
   ```
4. `npm run dev` dobara chalayein — terminal mein "✅ AI enabled" dikhega.

Production (Vercel) pe bhi enable karne ke liye: Vercel dashboard →
**Settings → Environment Variables** → `GEMINI_API_KEY` add karein → Redeploy.

---

## Deploying to Vercel

Zero-config hai — Vite frontend aur `/api` folder khud detect ho jate hain.

1. GitHub pe push karein (`git add .` → `git commit` → `git push`).
2. [vercel.com/new](https://vercel.com/new) pe jaake ye GitHub repo import
   karein.
3. Sab default settings rehne dein (Framework Preset: Vite) aur **Deploy**
   dabayein.
4. Har future `git push` khud-ba-khud naya deploy trigger kar dega.
