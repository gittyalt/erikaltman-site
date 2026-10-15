/* ============================================================
   Google Reviews — loaded live from Google on each visit.
   Google's Places terms don't allow saving reviews into the site,
   so nothing here is cached or committed; the browser asks Google
   directly. If anything fails, the section stays hidden.
   ============================================================ */
(function () {
  // Browser key: restrict it to erikaltman.com in Google Cloud.
  const GOOGLE_MAPS_KEY = 'AIzaSyAwd3BZmpwI4WkLIssLC_kJV2Cb5YcYBGs';
  // Erik's Google Business Profile Place ID (starts with "ChIJ").
  const PLACE_ID = 'ChIJsU1W-oR5OakR91dSJVthaXY';
  // Display order by reviewer name (as shown on Google). Any review Google
  // returns that isn't listed here appears after these, in Google's order.
  const ORDER = ['Eric Englund', 'Ashley Busacca', 'Ryan Darcey', 'Emily Flynn', 'Richard H'];
  // Reviewers to leave out of the homepage carousel.
  const HIDE = ['Aaron Tidman', 'Christopher Westcott', 'Morgan Shorum'];

  const section = document.getElementById('reviews');
  if (!section || !GOOGLE_MAPS_KEY || !PLACE_ID) return;

  const track = section.querySelector('.reviews-track');
  const summary = section.querySelector('[data-reviews-summary]');
  const allLink = section.querySelector('[data-reviews-link]');

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function stars(rating) {
    const r = Math.round(rating || 0);
    return '★'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r));
  }

  function card(review) {
    const c = el('div', 'review-card');
    const s = el('div', 'review-stars', stars(review.rating));
    s.setAttribute('aria-label', (review.rating || 0) + ' out of 5 stars');
    c.append(s);

    const text = (review.text || '').trim();
    if (text) c.append(el('p', 'review-text', '“' + text + '”'));

    const a = review.authorAttribution || {};
    const author = el('div', 'review-author');
    if (a.photoURI) {
      const img = el('img', 'review-avatar');
      img.src = a.photoURI;
      img.alt = '';
      img.width = 32; img.height = 32;
      img.referrerPolicy = 'no-referrer';
      img.loading = 'lazy';
      author.append(img);
    }
    const who = el('div', 'review-who');
    const name = a.uri ? el('a', 'review-name', a.displayName || 'Google user') : el('span', 'review-name', a.displayName || 'Google user');
    if (a.uri) { name.href = a.uri; name.target = '_blank'; name.rel = 'noopener'; }
    who.append(name);
    if (review.relativePublishTimeDescription) who.append(el('span', 'review-date', review.relativePublishTimeDescription));
    author.append(who);
    c.append(author);
    return c;
  }

  async function run() {
    try {
      const { Place } = await google.maps.importLibrary('places');
      const place = new Place({ id: PLACE_ID });
      await place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews', 'googleMapsURI'] });

      const norm = n => (n || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      const rank = r => {
        const name = norm(r.authorAttribution && r.authorAttribution.displayName);
        const i = ORDER.findIndex(o => name === norm(o) || name.startsWith(norm(o) + ' '));
        return i === -1 ? ORDER.length : i;
      };
      const reviews = (place.reviews || [])
        .filter(r => r && (r.text || r.rating))
        .filter(r => {
          const name = norm(r.authorAttribution && r.authorAttribution.displayName);
          return !HIDE.some(h => name === norm(h) || name.startsWith(norm(h) + ' '));
        })
        .map((r, i) => ({ r, i }))
        .sort((a, b) => (rank(a.r) - rank(b.r)) || (a.i - b.i))
        .map(x => x.r);
      if (!reviews.length) return;

      reviews.forEach(r => track.append(card(r)));

      if (place.rating && place.userRatingCount) {
        summary.textContent = place.rating.toFixed(1) + ' ★ from ' + place.userRatingCount + ' Google review' + (place.userRatingCount === 1 ? '' : 's');
      }
      if (place.googleMapsURI) allLink.href = place.googleMapsURI; else allLink.remove();

      // Arrows live in the header, outside .carousel, so wire them here.
      const step = () => track.clientWidth * 0.6;
      const prev = section.querySelector('[data-prev]');
      const next = section.querySelector('[data-next]');
      if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

      section.hidden = false;
    } catch (e) {
      console.warn('Google reviews unavailable:', e);
    }
  }

  window.__eaReviewsInit = run;
  const s = document.createElement('script');
  s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_KEY) + '&v=weekly&loading=async&callback=__eaReviewsInit';
  s.async = true;
  s.onerror = () => console.warn('Google Maps script failed to load.');
  document.head.append(s);
})();
