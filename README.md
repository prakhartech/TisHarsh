# 💛 Tisha & Harsh — Wedding Website V3

An elegant, Rajasthani-themed wedding website with **3-tier guest access**, RSVP, live guestbook, event schedule, poems, hashtag kit, and admin dashboard.

---

## ✨ Tiered Guest Access

Different guests see different events — **no group knows about events they aren't invited to.**

| Code | For | Events Visible |
|------|-----|----------------|
| `parivar` | Close family (all 3 days) | Mehandi + Haldi + Bhat + Lagan + Sangeet + Baraat + Phere + Reception |
| `dost` | Friends (2 days) | Haldi + Bhat + Lagan + Sangeet + Baraat + Phere + Reception |
| `jashn` | Wider circle (wedding day) | Baraat + Varmala & Phere + Reception |

**How it works:** The gate screen asks for a code. Each code maps to which days are visible. The events page, homepage counter, and tagline all adapt automatically. Everything else (story, scroll, RSVP, wishes) is shared.

### Customising codes
Edit the `TIERS` object in `src/App.jsx`:
```js
const TIERS = {
  parivar: { label: "All Celebrations", days: [1, 2, 3], dateRange: "19 – 21 April 2026" },
  dost:    { label: "Celebrations",     days: [2, 3],    dateRange: "20 – 21 April 2026" },
  jashn:   { label: "Wedding Day",      days: [3],       dateRange: "21 April 2026" },
};
```

---

## 🔒 Security

| Layer | Details |
|-------|---------|
| Guest Gate | 3 separate codes — each unlocks a different event tier |
| Admin PIN | Dashboard locked behind `2104` (DDMM of wedding) |
| Supabase RLS | Only INSERT + SELECT allowed — no UPDATE/DELETE via API |
| Session Auth | Code stored in sessionStorage — resets on browser close |

---

## 🚀 Deploy in 15 Minutes

### 1. Supabase (Free)
Create project at [supabase.com](https://supabase.com), then run `supabase-setup.sql` in SQL Editor.

### 2. Vercel (Free)
```bash
# Push to GitHub, then:
# Vercel → Import → Add env vars → Deploy
```

Environment variables needed:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Share Links
Send different links with the code pre-communicated:
- Family WhatsApp: "Code: **parivar**"
- Friends group: "Code: **dost**"  
- Wider circle: "Code: **jashn**"

---

## 🛠 Local Dev

```bash
cp .env.example .env  # Add Supabase creds
npm install
npm run dev
```

Without Supabase creds → falls back to localStorage (local-only).

---

## 📁 Structure

```
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── supabase-setup.sql
└── src/
    ├── main.jsx
    ├── App.jsx        ← All pages, tier logic, design
    └── supabase.js    ← DB operations + localStorage fallback
```

---

Made with love for Tisha & Harsh 💛 #TisHarsh
