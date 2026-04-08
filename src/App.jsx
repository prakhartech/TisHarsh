import { getRSVPs, addRSVP as addRSVPDB, getWishes, addWish as addWishDB } from "./supabase";
import { useState, useEffect, useCallback } from "react";

// ─── TIER SYSTEM ───
const TIERS = {
  parivar: { label: "All Celebrations", days: [1, 2, 3], dateRange: "19 – 21 April 2026",
    checkinDates: ["19 Apr","20 Apr","21 Apr"], checkoutDates: ["20 Apr","21 Apr","22 Apr"] },
  dost:    { label: "Celebrations",     days: [2, 3],    dateRange: "20 – 21 April 2026",
    checkinDates: ["20 Apr","21 Apr"], checkoutDates: ["21 Apr","22 Apr"] },
  jashn:   { label: "Wedding Day",      days: [3],       dateRange: "21 April 2026",
    checkinDates: ["21 Apr"], checkoutDates: ["21 Apr","22 Apr"] },
};
const ADMIN_PIN = "Kill@273";
const WEDDING_DATE = new Date("2026-04-21T09:15:00+05:30");

const ALL_EVENTS = [
  { day: 1, date: "19th April 2026", label: "Day 1", events: [
    { title: "Chaak Poojan", time: "10:15 AM", icon: "🪔", venue: "Residence — Scheme 3, Alwar", desc: "The sacred beginning — the potter's wheel is worshipped, marking the start of wedding preparations with blessings and rituals at home." },
    { title: "Mehandi", time: "6:15 PM", icon: "🌿", venue: "Pavna Palace Shanti Kunj, Alwar", desc: "Tisha's hands bloom with intricate henna as the evening fills with music, colour and the warmth of loved ones." },
    { title: "Dinner", time: "8:15 PM", icon: "🍽️", venue: "Pavna Palace Shanti Kunj, Alwar", desc: "A sumptuous dinner to celebrate the first evening — family, friends and feasting under the Alwar sky." },
  ]},
  { day: 2, date: "20th April 2026", label: "Day 2", events: [
    { title: "Haldi", time: "11:15 AM", icon: "🌻", venue: "Pride Premier, Kati Ghati, Alwar", desc: "A golden morning drenched in turmeric, laughter and blessings — marking the sacred beginning of wedding rituals." },
    { title: "Maayra / Bhaat", time: "2:15 PM", icon: "🎁", venue: "Pride Premier, Kati Ghati, Alwar", desc: "A cherished family ritual where maternal relatives shower the bride and groom with gifts, sweets and heartfelt blessings." },
    { title: "Lagna Patrika", time: "5:15 PM", icon: "📜", venue: "Pride Premier, Kati Ghati, Alwar", desc: "The formal writing of destiny — the sacred wedding invitation is read aloud, sealing the union with prayers and family blessings." },
    { title: "Sagai / Cocktail", time: "8:15 PM", icon: "💎", venue: "Pride Premier, Kati Ghati, Alwar", desc: "Rings exchanged, promises made — followed by an evening of cocktails, music and celebrations under the stars." },
    { title: "Dinner", time: "8:15 PM", icon: "🍽️", venue: "Pride Premier, Kati Ghati, Alwar", desc: "A grand dinner spread to end an unforgettable day of ceremonies. Eat, laugh, repeat!" },
  ]},
  { day: 3, date: "21st April 2026", label: "Wedding Day", events: [
    { title: "Ghudchadi / Sehrabandi", time: "8:15 AM", icon: "👑", venue: "Pride Premier, Kati Ghati, Alwar", desc: "The groom is adorned — sehra tied, turban set, and the majestic horse awaits. Harsh transforms into the royal dulha!" },
    { title: "Nikasi", time: "9:15 AM", icon: "🐴", venue: "Pride Premier, Kati Ghati, Alwar", desc: "The grand departure — Harsh rides out with dhol, dancing and the entire baraat in full celebration mode!" },
    { title: "Panigrahan", time: "11:15 AM", icon: "🔥", venue: "Pride Premier, Kati Ghati, Alwar", desc: "The sacred ceremony — varmala, phere, and the moment two souls become one under the holy fire. Forever begins here." },
    { title: "Lunch", time: "1:15 PM", icon: "🍛", venue: "Pride Premier, Kati Ghati, Alwar", desc: "A grand celebratory feast after the wedding — family and friends come together to bless the newlyweds over a lavish spread." },
    { title: "Reception", time: "8:15 PM", icon: "🥂", venue: "Pride Premier, Kati Ghati, Alwar", desc: "The grand finale — dinner, dance and celebration as Mr. & Mrs. take their first bow together. Dress your best!" },
  ]},
];

const STORY = [
  { label: "DECEMBER 2025", title: "The Arrangement", text: "Two families, one careful introduction. An arranged meeting — polite, proper, and planned. Or so everyone thought.", icon: "🤝" },
  { label: "THE FIRST HELLO", title: "17th December, 1:00 PM", text: "Tisha walked in with a warm smile. Harsh forgot every rehearsed line. They sat down for what was supposed to be a polite introductory chat.", icon: "☀️" },
  { label: "JUST TALKING…", title: "1 PM → 6 PM · Five Hours", text: "What began as a formal meeting turned into five hours of uninterrupted conversation — laughter, dreams, stories, favourite books, childhood memories. Neither wanted it to end.", icon: "💬" },
  { label: "SAME DAY. SAME EVENING.", title: "6:00 PM — The Yes", text: "No second meeting needed. No back-and-forth. No overthinking. Just one quiet, certain, forever YES — spoken at 6 PM on the very same day.", icon: "💍" },
  { label: "ALWAR AWAITS", title: "19–21 April 2026", text: "What started with chai and conversation becomes a lifetime of love. Alwar, Rajasthan — where two families become one.", icon: "🏰" },
];

const HASHTAGS = {
  "Couple": ["#TisHarsh", "#TishaWedsHarsh", "#TishaAndHarsh", "#HarshKiTisha", "#TishaKaHarsh"],
  "Events": ["#TisHarshKiShaadi", "#TisHarshSangeet", "#TisHarshReception", "#AlwarWedding2026"],
  "Fun": ["#4GhanteWaliLoveStory", "#ArrangedButDestined", "#SaidYesAt6PM", "#FromChaToForever", "#MatchMadeInAlwar"],
  "Guests": ["#TisHarshSquad", "#TisHarshFam", "#AlwarParty", "#WeddingSzn2026"],
};

const SCROLL_HI = `Satrah December, dopahar ki dhoop mein,\nTisha-Harsh mili — do roohein, ek dhun mein. ☀️\n\nEk baje mili aankhein, chhe baje dil ka faisla,\nPaanch ghante ki baatein — aur ban gayi zindagi ka silsila.\n\n✦\n\nAb Alwar sajaega, phoolon ki bahar aayegi,\nTisha-Harsh ki shaadi — poori duniya dekhne aayegi! 💍\n\n19, 20, 21 April — teen din ka yeh jashan,\nAa jaana zaroor — tum hi ho humari aas, humara ehsaan. 🌸`;
const SCROLL_EN = `On the seventeenth of December, under the afternoon sun,\nTisha met Harsh — and two hearts beat as one. ☀️\n\nAt one they met eyes, at six the hearts knew,\nFive hours of talking — and a lifetime came into view.\n\n✦\n\nNow Alwar adorns itself with flowers and light,\nTisha-Harsh's wedding — a celebration so bright! 💍\n\nApril nineteen, twenty, twenty-one — three days of cheer,\nCome be part of our story — you're the ones we hold dear. 🌸`;

const PRELOADED_WISHES = [
  { name: "Priya Sharma", relation: "Best Friend", text: "Tisha & Harsh — knew from the moment you told me about those 5 hours that this was it! Can't wait for Alwar! 💍" },
  { name: "Rohan & Neha", relation: "College Friends", text: "5 hours on day one? That's not arranged marriage, that's destiny with paperwork! Love you both so much! 🌹" },
  { name: "Dadi Ji", relation: "Grandmother", text: "Beta, you've made this family complete. Khush raho, phalo phulo. Meri dua hamesha tumhare saath hai. 🙏" },
  { name: "The Office Gang", relation: "Work Friends", text: "Harsh bhai finally settled! Tisha, you have our deepest sympathies 😂 Just kidding — you two are perfect together!" },
  { name: "Meera Aunty", relation: "Family", text: "Bahut khushi hui yeh rishta dekhkar. Dono ki jodi bahut pyaari hai. God bless! ✨" },
];

const TICKER = [
  "💛 One meeting. Five hours. Forever.",
  "🏰 See you in Alwar, Rajasthan!",
  "💍 17 Dec 2025 — the day it all began",
  "✨ Arranged by families, destined by hearts",
  "🌸 #TisHarsh — mark your calendars!",
];

// ─── LOGO SVG ───
const Logo = ({ size = 100 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9b1b30"/><stop offset="50%" stopColor="#c9963c"/><stop offset="100%" stopColor="#1e3a5f"/></linearGradient>
      <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d4919b"/><stop offset="100%" stopColor="#9b1b30"/></linearGradient>
    </defs>
    <circle cx="100" cy="100" r="94" fill="none" stroke="url(#lg)" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="100" cy="100" r="87" fill="none" stroke="url(#lg)" strokeWidth="0.6" opacity="0.25" strokeDasharray="4 4"/>
    <path d="M100 72 C100 55,126 47,126 68 C126 85,100 105,100 105 C100 105,74 85,74 68 C74 47,100 55,100 72Z" fill="url(#hg)" opacity="0.1"/>
    <text x="100" y="80" textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="26" fontWeight="700" fill="url(#lg)">Tis</text>
    <text x="128" y="80" textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="14" fill="#c45c5c" opacity="0.5">♥</text>
    <text x="100" y="112" textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="26" fontWeight="700" fill="url(#lg)">Harsh</text>
    <text x="100" y="136" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="8" letterSpacing="4" fill="#8b6f5e" opacity="0.6">SINCE 17 DEC 2025</text>
    {[30,170].map(x=>[45,155].map(y=><circle key={x+"-"+y} cx={x} cy={y} r="2" fill={x<100?"#9b1b30":"#1e3a5f"} opacity="0.15"/>)).flat()}
  </svg>
);

// ─── JALI PATTERN (Rajasthani lattice) ───
const jaliSVG = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20Z' fill='none' stroke='%238b6f5e' stroke-width='0.3' opacity='0.08'/%3E%3Ccircle cx='20' cy='20' r='4' fill='none' stroke='%238b6f5e' stroke-width='0.3' opacity='0.06'/%3E%3C/svg%3E")`;

// ─── CSS ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --ivory: #faf7f2;
  --cream: #f5ede3;
  --warm-white: #fefcf8;
  --sand: #e8ddd0;
  --sand-light: #f2ebe0;
  --maroon: #9b1b30;
  --maroon-deep: #7a1426;
  --terracotta: #c4704e;
  --rose-gold: #b76e79;
  --dusty-rose: #d4919b;
  --gold: #c9963c;
  --gold-soft: #d4a843;
  --navy: #1e3a5f;
  --navy-light: #2c4f7a;
  --olive: #5a7a42;
  --text-dark: #2e2226;
  --text-body: #4e3e3a;
  --text-muted: #8a7a72;
  --card-bg: rgba(255,252,248,0.88);
  --card-border: rgba(155,27,48,0.08);
  --serif: 'Playfair Display', Georgia, serif;
  --body: 'DM Sans', sans-serif;
  --elegant: 'Cormorant Garamond', Georgia, serif;
}

* { margin:0; padding:0; box-sizing:border-box; }
body { background: var(--ivory); color: var(--text-dark); }
.app { min-height:100vh; font-family:var(--body); overflow-x:hidden; background: var(--ivory); background-image: ${jaliSVG}; }

/* ── Floating petals ── */
.petals { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
.petal { position:absolute; opacity:0.12; animation: drift 25s linear infinite; }
@keyframes drift { 0%{transform:translateY(105vh) rotate(0deg);opacity:0} 8%{opacity:0.12} 92%{opacity:0.12} 100%{transform:translateY(-5vh) rotate(360deg);opacity:0} }

/* ── Nav ── */
.nav { position:sticky; top:0; z-index:100; backdrop-filter:blur(16px); background:rgba(250,246,240,0.92); border-bottom:1px solid rgba(139,44,59,0.08); }
.nav-inner { max-width:1060px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:8px 16px; }
.nav-links { display:flex; gap:3px; flex-wrap:wrap; justify-content:center; }
.nav-link { background:none; border:1px solid transparent; color:var(--text-muted); font-family:var(--body); font-size:11px; padding:5px 10px; cursor:pointer; border-radius:20px; transition:all .3s; font-weight:500; letter-spacing:.3px; }
.nav-link:hover { color:var(--maroon); border-color:rgba(139,44,59,0.12); }
.nav-link.active { color:#fff; background:linear-gradient(135deg,var(--maroon),var(--navy)); border-color:transparent; font-weight:600; }
.nav-logout { color:var(--text-muted)!important; opacity:.5; transition:opacity .3s!important; }
.nav-logout:hover { opacity:1!important; color:var(--rose-gold)!important; }

/* ── Gate ── */
.gate { min-height:100vh; display:flex; align-items:center; justify-content:center; background: linear-gradient(160deg, var(--ivory) 0%, var(--cream) 30%, var(--sand-light) 60%, #e8d5c8 100%); background-image: ${jaliSVG}; }
.gate-card { text-align:center; padding:48px 36px; max-width:400px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:24px; box-shadow:0 20px 60px rgba(139,44,59,0.06); }
.gate-card h1 { font-family:var(--serif); font-size:30px; color:var(--maroon); margin:14px 0 4px; }
.gate-sub { color:var(--text-muted); font-family:var(--elegant); font-size:17px; margin-bottom:24px; }
.gate-input { width:100%; padding:13px 18px; background:var(--ivory); border:1px solid rgba(139,44,59,0.15); border-radius:12px; color:var(--text-dark); font-family:var(--body); font-size:15px; text-align:center; letter-spacing:3px; outline:none; transition:border .3s,box-shadow .3s; }
.gate-input:focus { border-color:var(--maroon); box-shadow:0 0 0 3px rgba(139,44,59,0.06); }
.gate-btn { margin-top:16px; width:100%; padding:13px; background:linear-gradient(135deg,var(--maroon),var(--gold),var(--navy)); border:none; border-radius:12px; color:#fff; font-family:var(--body); font-weight:600; font-size:13px; cursor:pointer; letter-spacing:1.5px; text-transform:uppercase; transition:transform .2s,box-shadow .3s; }
.gate-btn:hover { transform:scale(1.02); box-shadow:0 8px 24px rgba(139,44,59,0.15); }
.gate-error { color:var(--rose-gold); font-size:12px; margin-top:10px; }
.gate-hint { color:var(--text-muted); font-size:11px; margin-top:12px; opacity:.5; }
.gate-codes { margin-top:20px; padding-top:16px; border-top:1px solid var(--card-border); }
.gate-codes p { font-size:11px; color:var(--text-muted); line-height:1.7; }

/* ── Hero ── */
.hero { position:relative; min-height:88vh; display:flex; align-items:center; justify-content:center; text-align:center; overflow:hidden; background: linear-gradient(170deg, #faf7f2 0%, #f2e6dc 12%, #dfc0b0 28%, #c4704e 42%, #9b1b30 55%, #7a1426 65%, #1e3a5f 80%, #152a45 100%); }
.hero::before { content:''; position:absolute; inset:0; background-image: ${jaliSVG}; opacity:.3; }
.hero-content { position:relative; z-index:2; padding:30px 20px; }
.hero-eyebrow { font-family:var(--elegant); font-size:16px; color:rgba(58,42,36,0.6); letter-spacing:4px; text-transform:uppercase; }
.hero-eyebrow::before,.hero-eyebrow::after { content:' ✦ '; color:var(--terracotta); opacity:.5; }
.hero-names { font-family:var(--serif); font-size:clamp(50px,12vw,88px); color:var(--text-dark); line-height:1.05; margin:8px 0; }
.hero-names-white { color:#fff; text-shadow:0 2px 20px rgba(0,0,0,.15); }
.hero-amp { display:block; font-size:.28em; color:var(--gold); margin:2px 0; letter-spacing:6px; }
.hero-date { font-family:var(--body); font-size:14px; letter-spacing:4px; text-transform:uppercase; margin:16px 0 4px; }
.hero-date-dark { color:var(--text-body); }
.hero-date-light { color:rgba(255,255,255,.85); }
.hero-location { font-family:var(--elegant); font-size:15px; letter-spacing:3px; text-transform:uppercase; }
.hero-loc-dark { color:var(--text-muted); }
.hero-loc-light { color:rgba(255,255,255,.55); }

/* Countdown */
.countdown { display:flex; gap:14px; justify-content:center; margin:28px 0 14px; flex-wrap:wrap; }
.cd-unit { border:1px solid rgba(139,44,59,0.2); border-radius:14px; padding:12px 16px; min-width:68px; text-align:center; backdrop-filter:blur(8px); }
.cd-unit-dark { background:rgba(250,246,240,0.25); }
.cd-unit-light { background:rgba(90,26,40,0.2); }
.cd-num { font-family:var(--serif); font-size:32px; line-height:1; }
.cd-num-dark { color:var(--maroon); }
.cd-num-light { color:var(--cream); }
.cd-label { font-size:9px; text-transform:uppercase; letter-spacing:2px; margin-top:3px; }
.cd-label-dark { color:var(--text-muted); }
.cd-label-light { color:rgba(255,255,255,.5); }

/* Live chips */
.live-chips { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin:14px 0; }
.chip { padding:5px 14px; border-radius:20px; font-size:12px; border:1px solid rgba(139,44,59,0.15); backdrop-filter:blur(6px); }
.chip-dark { background:rgba(250,246,240,0.3); color:var(--text-body); }
.chip-light { background:rgba(90,26,40,0.15); color:rgba(255,255,255,.8); }
.chip span { font-weight:600; color:var(--maroon); }
.chip-light span { color:var(--cream); }

/* Ticker */
.ticker-wrap { overflow:hidden; margin:18px 0 8px; }
.ticker { display:flex; animation:tickerScroll 45s linear infinite; white-space:nowrap; }
.ticker-item { padding:0 36px; font-family:var(--elegant); font-size:16px; font-style:italic; flex-shrink:0; }
.ticker-dark { color:rgba(58,42,36,0.35); }
.ticker-light { color:rgba(255,255,255,0.35); }
@keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* Tagline */
.tagline { margin:14px auto; padding:10px 26px; border:1px solid rgba(139,44,59,0.12); border-radius:28px; font-family:var(--elegant); font-size:16px; font-style:italic; display:inline-block; backdrop-filter:blur(6px); }
.tagline-dark { background:rgba(250,246,240,0.3); color:var(--text-body); }
.tagline-light { background:rgba(90,26,40,0.15); color:rgba(255,255,255,.7); }

/* CTAs */
.hero-ctas { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:18px; }
.cta { padding:11px 26px; border-radius:28px; font-family:var(--body); font-size:13px; font-weight:600; cursor:pointer; transition:all .3s; border:none; }
.cta-primary { background:linear-gradient(135deg,var(--maroon),var(--terracotta)); color:#fff; }
.cta-ghost { background:transparent; border:1px solid rgba(139,44,59,0.25); }
.cta-ghost-dark { color:var(--text-body); }
.cta-ghost-light { color:rgba(255,255,255,.8); border-color:rgba(255,255,255,.25); }
.cta:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(139,44,59,0.12); }

/* ── Sections ── */
.section { max-width:860px; margin:0 auto; padding:56px 20px; position:relative; z-index:1; }
.s-eye { font-family:var(--elegant); font-size:13px; color:var(--terracotta); letter-spacing:4px; text-transform:uppercase; text-align:center; margin-bottom:8px; }
.s-eye::before,.s-eye::after { content:' ✦ '; opacity:.4; }
.s-title { font-family:var(--serif); font-size:32px; color:var(--text-dark); text-align:center; margin-bottom:6px; }
.s-sub { font-family:var(--elegant); font-size:16px; color:var(--text-muted); text-align:center; margin-bottom:40px; font-style:italic; }
.gold-line { width:40px; height:2px; background:linear-gradient(90deg,transparent,var(--terracotta),transparent); margin:12px auto 18px; }

/* ── Numbers ── */
.numbers-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:16px; padding:22px; margin:0 auto 36px; max-width:580px; text-align:center; box-shadow:0 4px 20px rgba(139,44,59,0.04); }
.numbers-label { font-size:10px; color:var(--terracotta); letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; }
.numbers-row { display:flex; justify-content:center; gap:20px; flex-wrap:wrap; }
.n-val { font-family:var(--serif); font-size:20px; color:var(--text-dark); }
.n-lbl { font-size:9px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }

/* ── Timeline ── */
.timeline { max-width:620px; margin:0 auto; }
.tl-item { display:flex; gap:16px; margin-bottom:28px; animation:fadeUp .6s ease forwards; opacity:0; }
.tl-item:nth-child(1){animation-delay:.1s}.tl-item:nth-child(2){animation-delay:.2s}.tl-item:nth-child(3){animation-delay:.25s}.tl-item:nth-child(4){animation-delay:.3s}.tl-item:nth-child(5){animation-delay:.35s}
.tl-icon { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,rgba(139,44,59,0.08),rgba(201,120,74,0.08)); border:1px solid var(--card-border); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.tl-body { flex:1; background:var(--card-bg); border:1px solid var(--card-border); border-radius:14px; padding:18px 22px; box-shadow:0 2px 12px rgba(139,44,59,0.03); }
.tl-label { font-size:10px; color:var(--terracotta); letter-spacing:2px; text-transform:uppercase; margin-bottom:3px; }
.tl-title { font-family:var(--serif); font-size:17px; color:var(--text-dark); margin-bottom:6px; }
.tl-text { font-size:13.5px; color:var(--text-muted); line-height:1.7; }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

/* ── Events ── */
.day-group { margin-bottom:32px; }
.day-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid var(--card-border); }
.day-badge { padding:5px 14px; background:linear-gradient(135deg,var(--maroon),var(--terracotta)); color:#fff; font-size:11px; font-weight:700; border-radius:18px; letter-spacing:.5px; }
.day-date { font-family:var(--elegant); font-size:15px; color:var(--text-muted); font-style:italic; }
.ev-card { display:flex; gap:14px; padding:18px; margin-bottom:12px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:14px; transition:all .3s; box-shadow:0 2px 10px rgba(139,44,59,0.02); }
.ev-card:hover { border-color:rgba(139,44,59,0.18); transform:translateX(3px); }
.ev-icon { font-size:24px; width:40px; height:40px; border-radius:10px; background:rgba(139,44,59,0.05); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ev-info { flex:1; }
.ev-top { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:4px; }
.ev-name { font-family:var(--serif); font-size:17px; color:var(--maroon); }
.ev-time { font-size:10px; color:var(--text-muted); padding:3px 10px; border:1px solid rgba(139,44,59,0.1); border-radius:10px; }
.ev-desc { font-size:13px; color:var(--text-muted); line-height:1.65; }
.ev-venue { font-size:11px; color:var(--olive); margin-bottom:5px; display:flex; align-items:center; gap:4px; }
.ev-venue::before { content:'📍'; font-size:10px; }

/* ── Scroll ── */
.scroll-outer { max-width:580px; margin:0 auto; }
.scroll-toggle-w { text-align:center; margin-bottom:24px; }
.scroll-toggle { display:inline-flex; border:1px solid var(--card-border); border-radius:28px; overflow:hidden; }
.s-btn { padding:9px 24px; border:none; background:transparent; color:var(--text-muted); font-family:var(--body); font-size:13px; cursor:pointer; transition:all .3s; font-weight:500; }
.s-btn.active { background:linear-gradient(135deg,var(--maroon),var(--terracotta)); color:#fff; font-weight:600; }
.scroll-card { background:var(--card-bg); border:1px solid rgba(139,44,59,0.12); border-radius:20px; padding:36px 28px; text-align:center; box-shadow:0 8px 30px rgba(139,44,59,0.04); }
.sc-stars { color:var(--terracotta); font-size:12px; letter-spacing:10px; margin-bottom:14px; }
.sc-names { font-family:var(--serif); font-size:28px; color:var(--text-dark); margin-bottom:4px; }
.sc-meta { font-size:12px; color:var(--text-muted); letter-spacing:2px; text-transform:uppercase; }
.sc-poem { font-family:var(--elegant); font-size:17px; line-height:2; color:var(--text-dark); white-space:pre-line; margin:22px 0; }
.sc-hash { font-family:var(--serif); font-size:17px; color:var(--maroon); }
.sc-footer { font-size:11px; color:var(--text-muted); letter-spacing:2px; text-transform:uppercase; margin-top:16px; padding-top:14px; border-top:1px solid var(--card-border); }

/* ── Forms ── */
.form-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:18px; padding:28px 24px; max-width:500px; margin:0 auto; box-shadow:0 4px 20px rgba(139,44,59,0.03); }
.fc-title { font-family:var(--serif); font-size:17px; color:var(--text-dark); margin-bottom:18px; }
.fg { margin-bottom:14px; }
.fl { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; display:block; }
.fi,.fs { width:100%; padding:12px 14px; background:var(--ivory); border:1px solid rgba(139,44,59,0.1); border-radius:10px; color:var(--text-dark); font-family:var(--body); font-size:14px; outline:none; transition:border .3s; }
.fi:focus,.fs:focus { border-color:var(--maroon); box-shadow:0 0 0 3px rgba(139,44,59,0.05); }
.fi::placeholder { color:rgba(139,111,94,0.4); }
.fs option { background:var(--ivory); }
.fr { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.sub-btn { width:100%; padding:14px; background:linear-gradient(135deg,var(--maroon),var(--navy)); border:none; border-radius:12px; color:#fff; font-family:var(--body); font-weight:600; font-size:13px; cursor:pointer; letter-spacing:1px; transition:all .2s; margin-top:4px; }
.sub-btn:hover { transform:scale(1.01); box-shadow:0 6px 18px rgba(139,44,59,0.15); }
.sub-btn:disabled { opacity:.5; cursor:not-allowed; }

/* RSVP success */
.rsvp-ok { text-align:center; padding:36px 20px; }
.rsvp-ok h3 { font-family:var(--serif); font-size:24px; color:var(--maroon); margin-bottom:10px; }

/* ── Wishes ── */
.w-count { font-size:14px; color:var(--text-muted); text-align:center; margin-bottom:20px; }
.w-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:14px; padding:18px; margin-bottom:12px; position:relative; box-shadow:0 2px 8px rgba(139,44,59,0.02); }
.w-flower { position:absolute; right:14px; top:14px; font-size:16px; opacity:.35; }
.w-name { font-family:var(--serif); font-size:15px; color:var(--text-dark); }
.w-rel { font-size:11px; color:var(--terracotta); margin-bottom:6px; }
.w-text { font-size:13px; color:var(--text-muted); line-height:1.65; font-style:italic; }
.w-text::before,.w-text::after { content:'"'; }

/* ── Hashtags ── */
.hc { margin-bottom:22px; }
.hc-title { font-family:var(--serif); font-size:16px; color:var(--maroon); margin-bottom:8px; }
.h-tags { display:flex; flex-wrap:wrap; gap:7px; }
.h-tag { padding:6px 14px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:18px; font-size:13px; color:var(--text-body); cursor:pointer; transition:all .3s; }
.h-tag:hover,.h-tag.copied { border-color:var(--maroon); color:var(--maroon); background:rgba(139,44,59,0.04); }

/* ── Admin ── */
.a-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin-bottom:24px; }
.a-stat { background:var(--card-bg); border:1px solid var(--card-border); border-radius:14px; padding:16px; text-align:center; }
.a-num { font-family:var(--serif); font-size:28px; color:var(--maroon); }
.a-lbl { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
.a-table { width:100%; border-collapse:collapse; margin-top:14px; }
.a-table th { text-align:left; padding:8px; font-size:10px; color:var(--terracotta); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--card-border); }
.a-table td { padding:8px; font-size:12px; color:var(--text-muted); border-bottom:1px solid rgba(139,44,59,0.04); }

/* Copy btn */
.cp-btn { padding:6px 16px; background:rgba(139,44,59,0.04); border:1px solid rgba(139,44,59,0.12); border-radius:8px; color:var(--maroon); font-size:11px; cursor:pointer; font-family:var(--body); transition:all .2s; }
.cp-btn:hover { background:rgba(139,44,59,0.08); }

/* Footer */
.footer { text-align:center; padding:32px 20px; border-top:1px solid var(--card-border); margin-top:36px; position:relative; z-index:1; }
.footer-hash { font-family:var(--serif); font-size:18px; color:var(--maroon); margin:10px 0 6px; }
.footer-det { font-size:11px; color:var(--text-muted); line-height:1.8; }

/* Toast */
.toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,var(--maroon),var(--terracotta)); color:#fff; padding:10px 26px; border-radius:28px; font-size:13px; font-weight:600; z-index:200; animation:toastIn .3s ease; box-shadow:0 8px 24px rgba(139,44,59,0.2); }
@keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(14px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

/* ── Responsive ── */
@media(max-width:600px) {
  .hero-names{font-size:46px} .nav-link{font-size:10px;padding:4px 7px} .section{padding:36px 16px}
  .fr{grid-template-columns:1fr} .cd-unit{min-width:58px;padding:10px 12px} .cd-num{font-size:26px}
  .scroll-card{padding:24px 16px} .sc-poem{font-size:15px} .tl-item{flex-direction:column;gap:8px}
}
`;

// ─── Helpers ───
async function sGet(k){if(k=="tisharsh-rsvps")return getRSVPs();if(k=="tisharsh-wishes")return getWishes();try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}}
async function sSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

function useCountdown(){
  const[d,setD]=useState({});
  useEffect(()=>{const c=()=>{let ms=Math.max(0,WEDDING_DATE-new Date());setD({days:Math.floor(ms/864e5),hours:Math.floor(ms%864e5/36e5),mins:Math.floor(ms%36e5/6e4),secs:Math.floor(ms%6e4/1e3)})};c();const id=setInterval(c,1000);return()=>clearInterval(id)},[]);
  return d;
}

function useLiveStats(){
  const[s,setS]=useState({a:0,g:0,w:0});
  useEffect(()=>{const l=async()=>{const r=(await sGet("tisharsh-rsvps"))||[];const w=(await sGet("tisharsh-wishes"))||[];setS({a:r.filter(x=>x.attending==="yes").length,g:r.filter(x=>x.attending==="yes").reduce((a,x)=>a+(parseInt(x.guests)||1),0),w:w.length+PRELOADED_WISHES.length})};l();const id=setInterval(l,8000);return()=>clearInterval(id)},[]);
  return s;
}

function Petals(){
  const p=["🌸","🌺","🪷","✿","❀","🌼"];
  return <div className="petals">{Array.from({length:14}).map((_,i)=><span key={i} className="petal" style={{left:`${(i*8)%100}%`,animationDelay:`${i*2.2}s`,animationDuration:`${20+(i%4)*5}s`,fontSize:`${12+(i%3)*5}px`}}>{p[i%p.length]}</span>)}</div>;
}

// ─── APP ───
export default function App(){
  const[tier,setTier]=useState(null); // null = not authed, string = tier key
  const[code,setCode]=useState("");
  const[err,setErr]=useState("");
  const[page,setPage]=useState("home");
  const[toast,setToast]=useState("");
  const showToast=useCallback(m=>{setToast(m);setTimeout(()=>setToast(""),2200)},[]);

  // Gate always shows on refresh — sessionStorage used only for logout/switch
  
  const handleGate=()=>{
    const c=code.toLowerCase().trim();
    if(TIERS[c]){setTier(c);try{sessionStorage.setItem("th_tier",c)}catch{}}
    else setErr("That code doesn't match. Check with Tisha or Harsh!");
  };

  const handleLogout=()=>{setTier(null);setCode("");setPage("home");try{sessionStorage.removeItem("th_tier")}catch{}};

  const tierData=tier?TIERS[tier]:null;
  const visibleEvents=tier?ALL_EVENTS.filter(d=>tierData.days.includes(d.day)):[];
  const totalEvCount=visibleEvents.reduce((a,d)=>a+d.events.length,0);
  const daysCount=visibleEvents.length;

  const PAGES_VISIBLE=["home","story","events","scroll","rsvp","wishes","hashtags","admin"];

  if(!tier) return(
    <div className="app"><style>{css}</style><Petals/>
      <div className="gate"><div className="gate-card">
        <Logo size={90}/>
        <h1>Tisha & Harsh</h1>
        <p className="gate-sub">Enter your invitation code to unlock</p>
        <input className="gate-input" type="text" placeholder="• • • • • • • •" value={code} onChange={e=>{setCode(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&handleGate()}/>
        <button className="gate-btn" onClick={handleGate}>Unlock Invitation ✨</button>
        {err&&<p className="gate-error">{err}</p>}
        <p className="gate-hint">Your code was shared by Tisha or Harsh</p>
      </div></div>
    </div>
  );

  return(
    <div className="app"><style>{css}</style><Petals/>
      <nav className="nav"><div className="nav-inner">
        <div style={{cursor:"pointer"}} onClick={()=>setPage("home")}><Logo size={34}/></div>
        <div className="nav-links">{PAGES_VISIBLE.map(p=><button key={p} className={`nav-link ${page===p?"active":""}`} onClick={()=>setPage(p)}>{PAGE_LABELS[p]}</button>)}<button className="nav-link nav-logout" onClick={handleLogout} title="Switch code">🚪</button></div>
      </div></nav>

      {page==="home"&&<HomePage tier={tier} tierData={tierData} daysCount={daysCount} totalEvCount={totalEvCount} onNav={setPage}/>}
      {page==="story"&&<StoryPage tier={tier}/>}
      {page==="events"&&<EventsPage events={visibleEvents} tier={tier}/>}
      {page==="scroll"&&<ScrollPage/>}
      {page==="rsvp"&&<RSVPPage showToast={showToast} tier={tier}/>}
      {page==="wishes"&&<WishesPage showToast={showToast}/>}
      {page==="hashtags"&&<HashtagsPage showToast={showToast}/>}
      {page==="admin"&&<AdminPage/>}

      <footer className="footer">
        <Logo size={50}/>
        <div className="footer-hash">#TisHarsh</div>
        <div className="footer-det">Met: 17 Dec 2025 · 1 PM &nbsp;|&nbsp; Yes: 6 PM &nbsp;|&nbsp; Forever: 21 Apr 2026<br/>Alwar, Rajasthan &nbsp;✦&nbsp; With love 💛</div>
      </footer>
      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}

const PAGE_LABELS={home:"🏠 Home",story:"💛 Story",events:"🗓 Events",scroll:"📜 Scroll",rsvp:"💌 RSVP",wishes:"🌸 Wishes",hashtags:"# Tags",admin:"🔐"};

// ─── PAGES ───
function HomePage({tier,tierData,daysCount,totalEvCount,onNav}){
  const cd=useCountdown();const st=useLiveStats();
  // Determine if we're in the top (light bg) or bottom (dark bg) of gradient — use a mix
  return(
    <div className="hero"><div className="hero-content">
      <div className="hero-eyebrow" style={{color:"rgba(58,42,36,0.5)"}}>You are invited</div>
      <h1 className="hero-names">
        <span style={{color:"var(--text-dark)"}}>Tisha</span>
        <span className="hero-amp">🌸 ● 🌸</span>
        <span className="hero-names-white">Harsh</span>
      </h1>
      <div className="hero-date hero-date-light">{tierData.dateRange}</div>
      <div className="hero-location hero-loc-light">Alwar · Rajasthan</div>
      <div className="countdown">
        {[["days",cd.days],["hours",cd.hours],["mins",cd.mins],["secs",cd.secs]].map(([l,v])=>(
          <div className="cd-unit cd-unit-light" key={l}><div className="cd-num cd-num-light">{v??0}</div><div className="cd-label cd-label-light">{l}</div></div>
        ))}
      </div>
      <div style={{fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Counting down to Baraat · 21 April 9:15AM</div>
      <div className="live-chips">
        <div className="chip chip-light">🎉 <span>{st.a}</span> Coming</div>
        <div className="chip chip-light">🎊 <span>{st.g}</span> Guests</div>
        <div className="chip chip-light">🌸 <span>{st.w}</span> Wishes</div>
      </div>
      <div className="tagline tagline-light">"{daysCount} {daysCount===1?"day":"days"}. {totalEvCount} events. 2 families. 1 forever. 💛"</div>
      <div className="ticker-wrap"><div className="ticker">
        {[...TICKER,...TICKER].map((m,i)=><span key={i} className="ticker-item ticker-light">{m}</span>)}
      </div></div>
      <div className="hero-ctas">
        <button className="cta cta-primary" onClick={()=>onNav("story")}>Our Story 💛</button>
        <button className="cta cta-ghost cta-ghost-light" onClick={()=>onNav("events")}>See Events 🗓</button>
        <button className="cta cta-ghost cta-ghost-light" onClick={()=>onNav("rsvp")}>RSVP 💌</button>
      </div>
    </div></div>
  );
}

function StoryPage({tier}){
  const tierData=TIERS[tier]||TIERS.jashn;
  const chapters=STORY.map((ch,i)=>{
    if(i===STORY.length-1) return {...ch, title: tierData.dateRange};
    return ch;
  });
  return(
    <div className="section">
      <div className="s-eye">How it all began</div>
      <h2 className="s-title">The Story of Tisha & Harsh</h2><div className="gold-line"/>
      <p className="s-sub">17th December 2025 · Alwar, Rajasthan</p>
      <div className="numbers-card">
        <div className="numbers-label">The Numbers That Matter</div>
        <div className="numbers-row">
          {[["1 PM","First Hello"],["5 hrs","Of Talking"],["6 PM","Forever Yes"],["17 Dec","The Date"],["21 Apr","Wedding Day"]].map(([v,l])=><div key={l} style={{textAlign:"center"}}><div className="n-val">{v}</div><div className="n-lbl">{l}</div></div>)}
        </div>
      </div>
      <div className="timeline">
        {chapters.map((ch,i)=>(
          <div className="tl-item" key={i}>
            <div className="tl-icon">{ch.icon}</div>
            <div className="tl-body"><div className="tl-label">{ch.label}</div><div className="tl-title">{ch.title}</div><div className="tl-text">{ch.text}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsPage({events,tier}){
  const total=events.reduce((a,d)=>a+d.events.length,0);
  const getLabel=(idx)=>{
    const isLast=idx===events.length-1;
    if(events.length===1) return "Wedding Day";
    if(isLast) return `Day ${idx+1} · Wedding Day`;
    return `Day ${idx+1}`;
  };
  return(
    <div className="section">
      <div className="s-eye">All the fun ahead</div>
      <h2 className="s-title">{events.length} {events.length===1?"Day":"Days"} · {total} Events</h2><div className="gold-line"/>
      <p className="s-sub">Alwar, Rajasthan</p>
      {events.map((dg,idx)=>(
        <div className="day-group" key={dg.day}>
          <div className="day-hdr"><span className="day-badge">{getLabel(idx)}</span><span className="day-date">{dg.date}</span></div>
          {dg.events.map((ev,i)=>(
            <div className="ev-card" key={i}>
              <div className="ev-icon">{ev.icon}</div>
              <div className="ev-info"><div className="ev-top"><span className="ev-name">{ev.title}</span><span className="ev-time">{ev.time}</span></div>{ev.venue&&<div className="ev-venue">{ev.venue}</div>}<div className="ev-desc">{ev.desc}</div></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ScrollPage(){
  const[lang,setLang]=useState("hindi");
  return(
    <div className="section">
      <div className="s-eye">The song of their hearts</div>
      <h2 className="s-title">Printable Scroll</h2><div className="gold-line"/>
      <div className="scroll-outer">
        <div className="scroll-toggle-w"><div className="scroll-toggle">
          <button className={`s-btn ${lang==="hindi"?"active":""}`} onClick={()=>setLang("hindi")}>🇮🇳 हिंदी</button>
          <button className={`s-btn ${lang==="english"?"active":""}`} onClick={()=>setLang("english")}>🌍 English</button>
        </div></div>
        <div className="scroll-card">
          <div className="sc-stars">✦ ✦ ✦</div>
          <div className="sc-names">Tisha & Harsh</div>
          <div className="sc-meta">19 · 20 · 21 April 2026</div>
          <div className="sc-meta">Alwar, Rajasthan</div>
          <div className="sc-poem">{lang==="hindi"?SCROLL_HI:SCROLL_EN}</div>
          <div className="sc-hash">#TisHarsh</div>
          <div className="sc-footer">17 December 2025 → 21 April 2026<br/><span style={{letterSpacing:8}}>✦ ✦ ✦</span></div>
        </div>
      </div>
    </div>
  );
}

function RSVPPage({showToast,tier}){
  const tierData=TIERS[tier]||TIERS.jashn;
  const[f,setF]=useState({name:"",relation:"",attending:"yes",guests:"1",checkin:"",checkout:"",message:""});
  const[done,setDone]=useState(false);const[loading,setLoading]=useState(false);const st=useLiveStats();
  const submit=async()=>{if(!f.name.trim())return showToast("Please enter your name");setLoading(true);await addRSVPDB({...f,tier});setDone(true);setLoading(false);showToast("RSVP saved! 🎉")};
  if(done)return<div className="section"><div className="rsvp-ok"><h3>{f.attending==="yes"?`See you in Alwar, ${f.name}! 🎉`:`We'll miss you, ${f.name} 💛`}</h3><p style={{color:"var(--text-muted)",marginTop:8}}>{f.attending==="yes"?"Get ready for an unforgettable celebration!":"You'll be in our hearts."}</p></div></div>;
  return(
    <div className="section">
      <div className="s-eye">We'd love to see you</div>
      <h2 className="s-title">RSVP</h2><div className="gold-line"/>
      <div className="live-chips" style={{marginBottom:20}}>
        <div className="chip chip-dark">🎉 <span>{st.a}</span> Coming</div>
        <div className="chip chip-dark">🎊 <span>{st.g}</span> Guests</div>
      </div>
      <div className="form-card">
        <div className="fc-title">💌 Confirm Your Presence</div>
        <div className="fg"><label className="fl">Your Name *</label><input className="fi" placeholder="Enter your name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Relation</label><select className="fs" value={f.relation} onChange={e=>setF({...f,relation:e.target.value})}><option value="">Select...</option><option>Family</option><option>Friend</option><option>Colleague</option><option>Other</option></select></div>
          <div className="fg"><label className="fl">Attending?</label><select className="fs" value={f.attending} onChange={e=>setF({...f,attending:e.target.value})}><option value="yes">Yes, I'll be there!</option><option value="no">Sorry, can't make it</option></select></div>
        </div>
        {f.attending==="yes"&&<>
          <div className="fg"><label className="fl">Number of Guests</label><select className="fs" value={f.guests} onChange={e=>setF({...f,guests:e.target.value})}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          <div className="fr">
            <div className="fg"><label className="fl">🛬 Arrival Date</label><select className="fs" value={f.checkin} onChange={e=>setF({...f,checkin:e.target.value})}><option value="">Select...</option>{tierData.checkinDates.map(d=><option key={d} value={d}>{d} 2026</option>)}</select></div>
            <div className="fg"><label className="fl">🛫 Departure Date</label><select className="fs" value={f.checkout} onChange={e=>setF({...f,checkout:e.target.value})}><option value="">Select...</option>{tierData.checkoutDates.map(d=><option key={d} value={d}>{d} 2026</option>)}</select></div>
          </div>
        </>}
        <div className="fg"><label className="fl">Message for the couple</label><textarea className="fi" style={{minHeight:60,resize:"vertical"}} placeholder="Write something sweet... 🌸" value={f.message} onChange={e=>setF({...f,message:e.target.value})}/></div>
        <button className="sub-btn" onClick={submit} disabled={loading}>{loading?"Saving...":"Send RSVP 🌸"}</button>
      </div>
    </div>
  );
}

function WishesPage({showToast}){
  const[wishes,setWishes]=useState([]);const[name,setName]=useState("");const[rel,setRel]=useState("");const[text,setText]=useState("");const[loading,setLoading]=useState(true);
  useEffect(()=>{sGet("tisharsh-wishes").then(w=>{setWishes(w||[]);setLoading(false)})},[]);
  const all=[...wishes.map(w=>({...w})),...PRELOADED_WISHES];
  const post=async()=>{if(!name.trim()||!text.trim())return showToast("Please fill name and wish");const nw={name:name.trim(),relation:rel.trim(),text:text.trim()};const result=await addWishDB(nw);if(result)setWishes([result,...wishes]);setName("");setRel("");setText("");showToast("Wish posted! 🌸")};
  return(
    <div className="section">
      <div className="s-eye">Shower them with love</div>
      <h2 className="s-title">Wishes & Blessings</h2><div className="gold-line"/>
      <div className="w-count">{all.length} wishes so far 🌸</div>
      <div className="form-card" style={{marginBottom:24}}>
        <div className="fc-title">💌 Leave Your Wish</div>
        <div className="fg"><input className="fi" placeholder="e.g. Priya, Rohan Uncle..." value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="fg"><input className="fi" placeholder="e.g. Best Friend, Dadi Ji, Colleague..." value={rel} onChange={e=>setRel(e.target.value)}/></div>
        <div className="fg"><textarea className="fi" style={{minHeight:60,resize:"vertical"}} placeholder="Write your wish or blessing here... 🌸" value={text} onChange={e=>setText(e.target.value)}/></div>
        <button className="sub-btn" onClick={post}>Send Wish 🌸</button>
      </div>
      {loading?<p style={{textAlign:"center",color:"var(--text-muted)"}}>Loading...</p>:all.map((w,i)=>(
        <div className="w-card" key={i}><span className="w-flower">🌸</span><div className="w-name">{w.name}</div>{w.relation&&<div className="w-rel">{w.relation}</div>}<div className="w-text">{w.text}</div></div>
      ))}
    </div>
  );
}

function HashtagsPage({showToast}){
  const[copied,setCopied]=useState("");
  const cp=t=>{navigator.clipboard?.writeText?.(t);setCopied(t);showToast(`Copied: ${t}`);setTimeout(()=>setCopied(""),1500)};
  const cpAll=()=>{navigator.clipboard?.writeText?.(Object.values(HASHTAGS).flat().join(" "));showToast("All copied!")};
  return(
    <div className="section">
      <h2 className="s-title">#TisHarsh</h2><div className="gold-line"/><p className="s-sub">Tap any tag to copy</p>
      <div style={{textAlign:"center",marginBottom:18}}><button className="cp-btn" onClick={cpAll}>📋 Copy All</button></div>
      {Object.entries(HASHTAGS).map(([cat,tags])=>(
        <div className="hc" key={cat}><div className="hc-title">{cat}</div><div className="h-tags">{tags.map(t=><span key={t} className={`h-tag ${copied===t?"copied":""}`} onClick={()=>cp(t)}>{t}</span>)}</div></div>
      ))}
    </div>
  );
}

function AdminPage(){
  const[pin,setPin]=useState("");const[ok,setOk]=useState(false);const[rsvps,setRsvps]=useState([]);const[wishes,setWishes]=useState([]);const[loading,setLoading]=useState(false);
  const unlock=()=>{if(pin===ADMIN_PIN){setOk(true);loadData()}};
  const loadData=async()=>{setLoading(true);setRsvps((await sGet("tisharsh-rsvps"))||[]);setWishes((await sGet("tisharsh-wishes"))||[]);setLoading(false)};
  if(!ok)return(
    <div className="section" style={{maxWidth:360,textAlign:"center"}}>
      <h2 className="s-title">🔐 Admin</h2><div className="gold-line"/><p className="s-sub">Enter PIN to view responses</p>
      <input className="fi" type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&unlock()} style={{textAlign:"center",letterSpacing:6,maxWidth:160,margin:"0 auto"}}/>
      <br/><button className="sub-btn" style={{maxWidth:160,margin:"12px auto"}} onClick={unlock}>Unlock</button>
      <p style={{fontSize:10,color:"var(--text-muted)",marginTop:8}}>Contact Tisha or Harsh for the PIN</p>
    </div>
  );
  const att=rsvps.filter(r=>r.attending==="yes");const dec=rsvps.filter(r=>r.attending==="no");const tg=att.reduce((s,r)=>s+(parseInt(r.guests)||1),0);
  return(
    <div className="section">
      <h2 className="s-title">Admin Dashboard</h2><div className="gold-line"/>
      <button className="cp-btn" onClick={()=>setOk(false)} style={{display:"block",margin:"0 auto 18px"}}>🔒 Lock</button>
      {loading?<p style={{textAlign:"center",color:"var(--text-muted)"}}>Loading...</p>:<>
        <div className="a-stats">{[["RSVPs",rsvps.length],["Attending",att.length],["Declined",dec.length],["Guests",tg],["Wishes",wishes.length]].map(([l,n])=><div className="a-stat" key={l}><div className="a-num">{n}</div><div className="a-lbl">{l}</div></div>)}</div>
        <h3 style={{fontFamily:"var(--serif)",color:"var(--maroon)",marginBottom:8,fontSize:16}}>RSVP Responses</h3>
        {rsvps.length===0?<p style={{color:"var(--text-muted)"}}>No RSVPs yet</p>:<div style={{overflowX:"auto"}}><table className="a-table"><thead><tr><th>Name</th><th>Relation</th><th>Tier</th><th>Status</th><th>Guests</th><th>Arrival</th><th>Departure</th><th>Message</th></tr></thead><tbody>{rsvps.map((r,i)=><tr key={i}><td style={{color:"var(--text-dark)"}}>{r.name}</td><td>{r.relation||"—"}</td><td style={{color:"var(--terracotta)"}}>{r.tier||"—"}</td><td style={{color:r.attending==="yes"?"var(--olive)":"var(--rose-gold)"}}>{r.attending==="yes"?"✓":"✗"}</td><td>{r.attending==="yes"?r.guests:"—"}</td><td>{r.checkin||"—"}</td><td>{r.checkout||"—"}</td><td>{r.message||"—"}</td></tr>)}</tbody></table></div>}
        <h3 style={{fontFamily:"var(--serif)",color:"var(--maroon)",margin:"24px 0 8px",fontSize:16}}>Wishes</h3>
        {wishes.map((w,i)=><div className="w-card" key={i}><div className="w-name">{w.name}</div><div className="w-text">{w.text}</div></div>)}
      </>}
    </div>
  );
}
