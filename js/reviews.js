/* ============================================================
   Client reviews on the homepage.

   Two sources, merged into one carousel:
   1. Hand-picked reviews in data/reviews.json (copied by Erik from
      his Google listing).
   2. Live reviews from Google, fetched in the browser on each visit.
      Google's Places terms don't allow saving these into the site,
      so they are never cached or committed.

   ORDER sets the display order by reviewer name. A hand-picked review
   wins over a live one from the same person. Reviewers in HIDE never
   show. If Google fails, the hand-picked reviews still show; if there
   is nothing at all to show, the section stays hidden.
   ============================================================ */
(function () {
  // Browser key: restricted to erikaltman.com in Google Cloud.
  const GOOGLE_MAPS_KEY = 'AIzaSyAwd3BZmpwI4WkLIssLC_kJV2Cb5YcYBGs';
  // Google Place ID for Erik Altman Properties.
  const PLACE_ID = 'ChIJsU1W-oR5OakR91dSJVthaXY';
  // Display order by reviewer name. Anyone not listed goes after these.
  const ORDER = ['Eric Englund', 'Ashley Busacca', 'Ryan Darcey', 'Christopher Westcott', 'Emily Flynn', 'Richard H', 'Brittany Bafandeh', 'Aaron Tidman'];
  // Reviewers to leave out of the carousel.
  const HIDE = ['Morgan Shorum'];

  const section = document.getElementById('reviews');
  if (!section) return;

  const track = section.querySelector('.reviews-track');
  const summary = section.querySelector('[data-reviews-summary]');
  const allLink = section.querySelector('[data-reviews-link]');

  const norm = n => (n || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const sameName = (a, b) => { const x = norm(a), y = norm(b); return x === y || x.startsWith(y + ' ') || y.startsWith(x + ' '); };
  const rank = name => { const i = ORDER.findIndex(o => sameName(name, o)); return i === -1 ? ORDER.length : i; };
  const hidden = name => HIDE.some(h => sameName(name, h));

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function stars(rating) {
    const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  function initials(name) {
    return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  // r: { name, rating, text, photo?, profile?, when? }
  function card(r) {
    const c = el('div', 'review-card');
    const s = el('div', 'review-stars', stars(r.rating));
    s.setAttribute('aria-label', (r.rating || 0) + ' out of 5 stars');
    c.append(s);

    const text = (r.text || '').trim();
    if (text) {
      const p = el('p', 'review-text', '“' + text + '”');
      c.append(p);
      const more = el('button', 'review-more', 'Read more');
      more.type = 'button';
      more.hidden = true;
      more.addEventListener('click', () => {
        const open = p.classList.toggle('is-open');
        more.textContent = open ? 'Show less' : 'Read more';
      });
      c.append(more);
      const check = () => { if (!p.classList.contains('is-open')) more.hidden = !(p.scrollHeight > p.clientHeight + 2); };
      if ('ResizeObserver' in window) new ResizeObserver(check).observe(p);
      requestAnimationFrame(check);
      window.addEventListener('load', check);
    }

    const author = el('div', 'review-author');
    if (r.photo) {
      const img = el('img', 'review-avatar');
      img.src = r.photo; img.alt = ''; img.width = 32; img.height = 32;
      img.referrerPolicy = 'no-referrer'; img.loading = 'lazy';
      author.append(img);
    } else {
      const badge = el('span', 'review-avatar review-initials', initials(r.name));
      badge.setAttribute('aria-hidden', 'true');
      author.append(badge);
    }
    const who = el('div', 'review-who');
    const name = r.profile ? el('a', 'review-name', r.name) : el('span', 'review-name', r.name);
    if (r.profile) { name.href = r.profile; name.target = '_blank'; name.rel = 'noopener'; }
    who.append(name);
    if (r.when) who.append(el('span', 'review-date', r.when));
    author.append(who);
    c.append(author);
    return c;
  }

  async function loadPicked() {
    try {
      const res = await fetch('data/reviews.json', { cache: 'no-cache' });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.reviews || []).filter(r => r && r.name && r.text);
    } catch (e) { return []; }
  }

  function loadGoogle() {
    if (!GOOGLE_MAPS_KEY || !PLACE_ID) return Promise.resolve(null);
    return new Promise(resolve => {
      const timer = setTimeout(() => resolve(null), 10000);
      window.__eaReviewsInit = async () => {
        try {
          const { Place } = await google.maps.importLibrary('places');
          const place = new Place({ id: PLACE_ID });
          await place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews', 'googleMapsURI'] });
          clearTimeout(timer); resolve(place);
        } catch (e) {
          console.warn('Google reviews unavailable:', e);
          clearTimeout(timer); resolve(null);
        }
      };
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_KEY) + '&v=weekly&loading=async&callback=__eaReviewsInit';
      s.async = true;
      s.onerror = () => { console.warn('Google Maps script failed to load.'); clearTimeout(timer); resolve(null); };
      document.head.append(s);
    });
  }

  function wireArrows() {
    // The arrows sit in the header, outside .carousel, so wire them here.
    const step = () => track.clientWidth * 0.6;
    const prev = section.querySelector('[data-prev]');
    const next = section.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  async function run() {
    const [picked, place] = await Promise.all([loadPicked(), loadGoogle()]);

    const items = picked.map((r, i) => ({ r: { name: r.name, rating: r.rating || 5, text: r.text }, i }));
    const live = (place && place.reviews) || [];
    live.forEach((g, j) => {
      const a = g.authorAttribution || {};
      const name = a.displayName || 'Google user';
      if (!(g.text || g.rating)) return;
      const mine = items.find(x => sameName(x.r.name, name));
      if (mine) { // hand-picked text wins; borrow Google's photo and profile link
        mine.r.photo = a.photoURI; mine.r.profile = a.uri;
        return;
      }
      items.push({ r: { name, rating: g.rating, text: g.text, photo: a.photoURI, profile: a.uri, when: g.relativePublishTimeDescription }, i: 1000 + j });
    });

    const list = items
      .filter(x => !hidden(x.r.name))
      .sort((a, b) => (rank(a.r.name) - rank(b.r.name)) || (a.i - b.i))
      .map(x => x.r);
    if (!list.length) return;

    section.hidden = false;
    list.forEach(r => track.append(card(r)));

    if (place && place.rating && place.userRatingCount) {
      summary.textContent = place.rating.toFixed(1) + ' ★ from ' + place.userRatingCount + ' Google review' + (place.userRatingCount === 1 ? '' : 's');
    }
    if (place && place.googleMapsURI) allLink.href = place.googleMapsURI;
    else allLink.href = 'https://www.google.com/maps/place/?q=place_id:' + PLACE_ID;

    wireArrows();
  }

  run();
})();
