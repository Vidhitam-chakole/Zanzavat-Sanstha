# Events Directory

This folder holds all individual event detail HTML pages for Zanzavat Bahuudeshiya Shaikshanik Sanstha.

---

## How to Add a New Event

### Step 1: Duplicate `event-template.html`
Copy `event-template.html` and rename it to your event's name.
* Example: `tree-plantation-july-2026.html`

### Step 2: Edit Your New Event File
Open your new file in the editor. Search for `TODO:` comments and update:
1. **Title & Meta Description**: Update the `<title>` and `<meta name="description">`.
2. **Canonical & OG URL**: Change `https://www.zanzavatsanstha.in/events/event-template.html` to your new filename (`.../events/tree-plantation-july-2026.html`).
3. **Structured Data (JSON-LD)**: Update the event name, date, and location.
4. **Hero Banner**: Update the title, date, and banner background image.
5. **The Story**: Write your event summary and highlight paragraphs.
6. **Sidebar Information**: Set location, date, category, and numerical statistics.
7. **Photo Gallery**: Add image paths for event photos (supporting the click-to-enlarge Lightbox).

---

### Step 3: Add the Card to `events.html`
Open [`events.html`](../events.html) and locate `<div class="card-grid" id="events-grid">`.
Paste the following card HTML block at the top of the grid:

```html
<!-- New Event Card -->
<div class="card reveal active">
 <div class="card-img-wrapper">
  <img src="/assets/images/education-support/edu-card.webp" alt="Your Event Title" onerror="this.src='/assets/images/zanzavat-logo/zanzavat_logo.png';">
 </div>
 <div class="card-content">
  <div class="card-meta">
   <span class="icon">📅</span> July 12, 2026
  </div>
  <h3 class="card-title">Your Event Title</h3>
  <p class="card-text">Short summary of the event (1-2 sentences) describing what was accomplished.</p>
  <a href="/events/your-event-filename.html" class="btn btn-primary btn-sm" style="margin-top: auto; align-self: flex-start;">View Details</a>
 </div>
</div>
```

---

### Step 4 (Optional for SEO): Add to `sitemap.xml`
In `sitemap.xml` and `public/sitemap.xml`, add your new page:
```xml
<url>
    <loc>https://www.zanzavatsanstha.in/events/your-event-filename.html</loc>
    <lastmod>2026-07-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
</url>
```
