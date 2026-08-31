# Zanzavat Bahuudeshiya Shaikshanik Sanstha — Website

A registered non-governmental organization established in 1995, dedicated to child welfare, health services, and rural development in Nagpur, Maharashtra, India.

**Live locally:** `python server.py` → http://127.0.0.1:5000

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero carousel, impact counters, programs preview, Instagram feed, AI chat |
| About Us | `about.html` | History, mission/vision, leadership team, timeline |
| Our Impact | `impact.html` | Statistics, beneficiary stories, achievement cards |
| Programs | `programs.html` | Five focus areas: education, medical, food, clothing, student welfare |
| Events | `events.html` | Dynamic events list and detail view (driven by `events.json`) |
| Join Us | `join.html` | Volunteer registration form |
| Donate | `donate.html` | Sponsorship levels and UPI QR code |
| Contact | `contact.html` | Contact form and office location |

## Project Structure

```
├── index.html                  # Home page
├── about.html                  # About us
├── impact.html                 # Impact & stories
├── programs.html               # Focus area details
├── events.html                 # Events listing & detail
├── join.html                   # Volunteer registration
├── donate.html                 # Donation page
├── contact.html                # Contact form
├── server.py                   # Flask backend (API + static serving)
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (Supabase, Mail, Groq)
├── public/
│   └── assets/
│       ├── css/
│       │   └── style.css       # Single stylesheet (responsive)
│       ├── js/
│       │   ├── main.js         # Core app (nav, scroll, carousel, forms, AI chat)
│       │   ├── events.js       # Events router (hash-based detail view)
│       │   └── gallery.js      # Lightbox system (used by events gallery)
│       ├── data/
│       │   ├── events.json     # Events database
│       │   ├── contacts.json   # Contact form submissions
│       │   └── registrations.json  # Volunteer registrations
│       └── images/             # All site images organized by section
```

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript (ES6 classes)
- **Backend:** Python 3 / Flask
- **Database:** Supabase (with local JSON/CSV fallback)
- **AI Chat:** Groq API (OpenAI-compatible)
- **Email:** Flask-Mail (Gmail SMTP)

## Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Volunteer registration (name, email, phone, interest, message) |
| `/api/contact` | POST | Contact form submission (name, email, phone, subject, message) |
| `/api/chat` | POST | AI chat assistant (message → Groq API → reply) |

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure `.env` with your credentials:
   ```
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   MAIL_USERNAME=your_email
   MAIL_PASSWORD=your_app_password
   GROQ_API_KEY=your_groq_key
   ```

3. Run the server:
   ```bash
   python server.py
   ```

4. Open http://127.0.0.1:5000 in your browser.

## Features

- **Responsive Design** — Mobile-first layout with hamburger menu, works across all screen sizes
- **Hero Carousel** — Auto-rotating slides with touch swipe support
- **Scroll Reveal Animations** — Intersection Observer-based fade-in on scroll
- **Dynamic Events** — JSON-driven event cards with hash-based routing for detail views
- **Lightbox** — Click-to-expand images with keyboard and swipe navigation
- **AI Chat Assistant** — Floating chat widget powered by Groq API
- **Form Handling** — Client-side validation with server-side persistence (Supabase + local fallback)
- **Counter Animations** — Animated statistics with easing on viewport entry
- **Accessibility** — ARIA labels, semantic HTML, keyboard navigation support

## Image Guidelines

See `public/assets/images/README.md` for sizing and naming conventions for all image assets.

---

**Established 1995** · Nagpur, Maharashtra, India · [Instagram @zanzavat_sanstha](https://www.instagram.com/zanzavat_sanstha)
