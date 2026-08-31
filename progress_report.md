# DEPLOYMENT GUIDE — Zanzavat Sanstha Website

> **Read this file first.** It contains everything needed to understand, configure, and deploy the project. Do not read source files unless you need to modify logic.

---

## 1. Project Overview

An NGO website for **Zanzavat Bahuudeshiya Shaikshanik Sanstha** (est. 1995, Nagpur, India). Static HTML/CSS/JS frontend with a Python Flask backend serving 3 API endpoints. Data persists to Supabase (cloud) with local JSON/CSV fallback. AI chat powered by Groq API. Email notifications via Flask-Mail (Gmail SMTP).

---

## 2. Complete File Tree

```
Zanzavat-Sanstha-Web-page/
├── index.html                  # Home page (hero carousel, counters, programs, AI chat, insta videos)
├── about.html                  # History, mission/vision, leadership team, timeline
├── impact.html                 # Statistics, beneficiary stories, achievement cards
├── programs.html               # 5 focus areas: education, medical, food, clothing, welfare
├── events.html                 # Dynamic events list + detail view (JS-driven from events.json)
├── join.html                   # Volunteer registration form → /api/register
├── donate.html                 # Sponsorship tiers + UPI QR placeholder
├── contact.html                # Contact form → /api/contact
├── server.py                   # Flask backend (main server entry point)
├── requirements.txt            # Python dependencies (6 packages)
├── .env                        # Secrets (NOT in git, .gitignore'd)
├── .gitignore                  # Standard Python gitignore
├── README.md                   # Project documentation
├── DEPLOY.md                   # THIS FILE — deployment guide
├── public/
│   └── assets/
│       ├── css/
│       │   └── style.css       # Single responsive stylesheet (~2500 lines)
│       ├── js/
│       │   ├── main.js         # Core app class (nav, scroll, carousel, forms, AI chat)
│       │   ├── events.js       # EventsRouter class (hash-based event detail routing)
│       │   └── gallery.js      # GalleryController class (lightbox, filters, spotlight slider)
│       ├── data/
│       │   ├── events.json     # Events database (5 sample events)
│       │   ├── contacts.json   # Contact form submissions (local fallback)
│       │   └── registrations.json  # Volunteer registrations (local fallback)
│       └── images/
│           ├── README.md       # Image sizing/naming guide
│           ├── hero/           # hero-1.webp, hero-2.webp, hero-3.webp
│           ├── about/          # about-main.webp, about-banner.webp
│           ├── impact/         # impact-banner.webp, story-1.webp, story-2.webp
│           ├── education-support/  # edu-card.webp, edu-banner.webp, edu-focus.webp
│           ├── medical-camps/      # med-card.webp, med-focus.webp
│           ├── food-distribution/  # food-card.webp, food-focus.webp
│           ├── clothing-drives/    # clothing-focus.webp
│           ├── student-welfare/    # welfare-focus.webp
│           ├── volunteers/         # vol-banner.webp
│           ├── leadership/         # ajinkya-bhakre.webp, arya-sontake.webp
│           ├── team/               # member1.jpg through member12.jpg
│           ├── donations/          # donate-banner.webp
│           ├── gallery/            # Video-1.mp4 through Video-6.mp4
│           ├── logo/               # logo-placeholder.webp
│           └── zanzavat-logo/      # zanzavat_logo.png
```

---

## 3. Environment Variables (.env)

All are optional — the app works without them but with reduced functionality:

```
# Supabase (cloud database) — without this, data saves to local JSON/CSV files
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR...

# Gmail SMTP (contact/volunteer email notifications) — without this, emails are skipped
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password_here

# Groq AI Chat — without this, AI chat returns "not configured"
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-20b
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

---

## 4. Dependencies (requirements.txt)

```
Flask==3.0.0
Flask-Mail
python-dotenv
gunicorn
supabase
requests
```

Install: `pip install -r requirements.txt`

---

## 5. Backend API (server.py)

### Routes

| Route | Method | Purpose | Request Body | Response |
|-------|--------|---------|--------------|----------|
| `/` | GET | Serves index.html | — | HTML |
| `/api/register` | POST | Volunteer registration | `{name, email, phone, interest, message}` | `{status, message}` |
| `/api/contact` | POST | Contact form | `{name, email, phone, subject, message}` | `{status, message}` |
| `/api/chat` | POST | AI chat | `{message}` | `{status, reply}` |
| `/<path>` | GET | Static file serving | — | File or 403 for protected files |

### How Data Saves

1. If Supabase is configured and reachable → saves to Supabase table (`registrations` or `contacts`)
2. If Supabase fails or is unconfigured → saves to local `public/assets/data/*.json` AND appends to `*.csv`

### Protected Files

These are blocked from public access: `.env`, `server.py`, `requirements.txt`, `.gitignore`, `database.db`, any file starting with `.`

### Port

Default: **5000** (hardcoded in `__main__` block). For production, use gunicorn: `gunicorn server:app --bind 0.0.0.0:8000`

---

## 6. Frontend Architecture

### CSS (public/assets/css/style.css)

Single file, ~2500 lines. Uses CSS custom properties (`:root` variables). Responsive breakpoints:
- 1024px: Stacks flex layouts to column
- 768px: Hamburger menu, 2-col counters, single-col masonry
- 480px: Smallest screens, 2-col team grid, single-col events gallery

### JavaScript Classes

| File | Class | Purpose | Instantiated on |
|------|-------|---------|-----------------|
| `main.js` | `MainApp` | Header scroll, mobile menu, scroll reveal, counters, hero carousel, form submissions, AI chat | Every page |
| `events.js` | `EventsRouter` | Fetches events.json, renders list/detail views based on URL hash | events.html only |
| `gallery.js` | `GalleryController` | Gallery filters, lightbox modal, spotlight scrolling slider | events.html (lightbox) |

### Key UI Components

- **Hero Carousel**: 3 slides, auto-rotates every 3s, supports touch swipe
- **AI Chat**: Fixed-position launcher button → slide-in panel → sends to `/api/chat`
- **Scroll Reveal**: IntersectionObserver adds `.active` class to `.reveal` elements
- **Counter Animation**: Numbers count up with easing when viewport enters
- **Events**: Hash-based routing (`events.html#event-id`) toggles list/detail views
- **Lightbox**: Full-screen image overlay with prev/next/keyboard/touch navigation

### Form Submission Flow

1. User fills form → clicks submit
2. `main.js` intercepts submit → builds JSON payload → POSTs to `/api/register` or `/api/contact`
3. On success: shows green feedback banner, resets form
4. On error: shows red feedback banner with error message
5. All forms use `Content-Type: application/json` (not form-encoded)

---

## 7. Deployment Options

### Option A: Vercel (Recommended)

Vercel doesn't support long-running Flask processes. Convert to serverless functions:

**Project structure for Vercel:**
```
├── vercel.json
├── api/
│   ├── register.py    # Serverless function
│   ├── contact.py     # Serverless function
│   └── chat.py        # Serverless function
├── index.html         # Vercel serves root as static
├── about.html
├── ... (all HTML files stay at root)
└── public/            # Assets (CSS, JS, images, data)
    └── assets/...
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    { "src": "api/**/*.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

**Each api/*.py file** must export a `handler(request)` function (Vercel Python serverless format). Port Vercerless functions:
```python
from http.server import BaseHTTPRequestHandler
import json, os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)
        # ... process data ...
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
```

**Deploy:** `vercel` CLI or connect GitHub repo at vercel.com

### Option B: Render

```
Build Command: pip install -r requirements.txt
Start Command: gunicorn server:app --bind 0.0.0.0:$PORT
```

Works as-is. No code changes needed. Free tier.

### Option C: PythonAnywhere

Upload files → `pip install -r requirements.txt` → configure WSGI → reload. Free tier.

### Option D: Railway

Push to GitHub → New Project → Deploy from GitHub.
Start Command: `gunicorn server:app`. Free tier with $5 credit.

### Option E: Self-hosted VPS

```bash
pip install -r requirements.txt
gunicorn server:app --bind 127.0.0.1:8000 --workers 3
# + Nginx reverse proxy + SSL via certbot
```

---

## 8. Post-Deployment Checklist

- [ ] Environment variables set (SUPABASE_URL, SUPABASE_KEY at minimum)
- [ ] Supabase tables exist: `registrations` (columns: name, email, phone, interest, message, timestamp) and `contacts` (columns: name, email, phone, subject, message, timestamp)
- [ ] Site loads and hero carousel auto-rotates
- [ ] Mobile hamburger menu opens/closes
- [ ] Volunteer form submits successfully (check Supabase or local JSON)
- [ ] Contact form submits successfully
- [ ] AI chat responds (requires GROQ_API_KEY)
- [ ] Events page loads event cards from events.json
- [ ] All navigation links work across pages
- [ ] Images load (check browser console for 404s)

---

## 9. Supabase Table Schemas

If tables don't exist, create them in the Supabase SQL editor:

```sql
CREATE TABLE registrations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  interest TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
```

---

## 10. Known Limitations

- No user authentication or admin dashboard
- No rate limiting on API endpoints
- Local JSON/CSV fallback is not suitable for production (data loss on server restart for Vercel/Render)
- AI chat has no conversation memory (each request is stateless)
- Image uploads not supported (all images are pre-placed static files)
- `events.json` is a static file — editing requires redeployment
