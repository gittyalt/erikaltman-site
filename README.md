# Erik Altman — erikaltman.com

A sophisticated, image-forward marketing site for a Marin County real estate practice.

---

## 🚨 To preview the site on your computer

**Do NOT double-click `index.html`** — it will look broken (no styling, no images), which is exactly what you saw. That's because modern browsers block local files from loading each other for security reasons.

Instead, do this:

### On Mac
1. Open the `erikaltman` folder in Finder.
2. **Double-click `preview-mac.command`** — a Terminal window will open, a small local web server will start, and your default browser will open the site automatically at `http://localhost:8765`.
3. When you're done, close the Terminal window (or press Ctrl+C in it) to stop the server.

The first time you double-click, macOS may say it can't be opened because it's from an unidentified developer. To get past that: right-click the file → "Open" → "Open" again in the warning dialog. After that first time it'll launch normally.

### On Windows
1. Open the `erikaltman` folder.
2. **Double-click `preview-windows.bat`** — a command window will open, a small local web server will start, and your default browser will open the site.
3. When you're done, close the command window to stop the server.

If you don't have Python installed on Windows: install it from python.org (be sure to check "Add Python to PATH" during install), then double-click the file again.

### Or, if you prefer the manual route

Open a Terminal/PowerShell, navigate to the `erikaltman` folder, then run:
```
python3 -m http.server 8765
```
Then visit `http://localhost:8765` in your browser.

---

## What's in this folder

```
erikaltman/
├── index.html              ← Meet Erik (homepage)
├── properties.html         ← Properties grid
├── property.html           ← Single property detail (uses ?id= query param)
├── marintel.html           ← Market intelligence dashboard
├── developments.html       ← Developments grid
├── development.html        ← Single development detail
├── contact.html            ← Contact page
├── preview-mac.command     ← Double-click on Mac to preview
├── preview-windows.bat     ← Double-click on Windows to preview
├── css/styles.css          ← All styling
├── js/site.js              ← Nav, carousels, card rendering, animations
├── data/properties.json    ← THE database. Edit this to add/update listings.
└── images/                 ← All photography (currently SVG placeholders)
```

---

## Editing properties

All listings on the Properties page, the homepage carousel, and individual property detail pages are driven by **`data/properties.json`**.

Just ask me in chat — e.g., *"Add a new listing: 42 Main Street, Larkspur, status FOR SALE, 3 BD / 2 BA, 1,800 sq ft, $2.1M, seller representation"* — and I'll edit the JSON for you. Each entry has a `status` field (`SOLD`, `FOR SALE`, or `COMING SOON`), an `image` path, and the other fields.

Developments work the same way — they live in the `developments` array of the same JSON file.

---

## Replacing the placeholder images

The site currently uses 21 hand-illustrated SVG placeholders — each matched to the actual architectural style of that property. To swap in real photography, save your file into `/images/` with a sensible name, then either update the `image` path in `data/properties.json`, or just message me with the listing and the new filename and I'll do it.

**Recommended:** 1600px wide minimum for property cards. JPG quality 80–85 is plenty.

---

## Hosting options when you're ready to go live

The whole site is static — no server-side code. Easiest path:

### Netlify (free, recommended)
1. Go to **netlify.com**, sign up.
2. Drag-and-drop the entire `erikaltman/` folder onto the Netlify dashboard. Your site is live in seconds on a temporary URL.
3. In **Site settings → Domain management → Add custom domain**, enter `erikaltman.com`.
4. Netlify will show you DNS records to point at. Update those records wherever you bought the domain, and `erikaltman.com` will be live with automatic HTTPS within an hour or two.

Alternatives: **Cloudflare Pages**, **Vercel** — all free, all great.

---

## Brand notes

- **Background:** Limestone `#EFE8DC`
- **Primary type & spot:** Slate `#3A4248`
- **Accent (badges, hover, links):** Canyon Brick `#B05A3C`
- **Secondary accent (policy block on MarIntel):** Canopy `#455444`
- **Display type:** Cormorant Garamond
- **Body type:** Inter Tight

All colors are CSS variables at the top of `css/styles.css` — easy to tweak.

---

## What's still placeholder

- **Photography** — replace placeholders as described above.
- **MarIntel data** — currently illustrative example numbers.
- **Google Reviews** — representative quotes (the live Google Places feed needs an API integration).
- **Instagram feed** — placeholder tiles linking to your profile (live feed needs the Instagram API).

Just message me any time to make changes.
