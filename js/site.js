/* ============================================================
   ERIK ALTMAN — Site JavaScript
   ============================================================ */

/* ---------- Mobile Nav Toggle ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    if (!links.id) links.id = 'site-nav-links';
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-expanded', 'false');
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', (e) => {
      if (links.classList.contains('open') && !links.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  // Animate bar chart fills when in view
  const bars = document.querySelectorAll('.bar-fill');
  if (bars.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.dataset.width;
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => io.observe(b));
  }

  // Carousel controls
  document.querySelectorAll('[data-carousel]').forEach(track => {
    const wrap = track.closest('.carousel');
    if (!wrap) return;
    const prev = wrap.querySelector('[data-prev]');
    const next = wrap.querySelector('[data-next]');
    const scrollBy = () => track.clientWidth * 0.6;
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: scrollBy(), behavior: 'smooth' }));
  });
});

/* ---------- Format helpers ---------- */
function formatPrice(n) {
  if (!n || n === 0) return 'Price upon request';
  return '$' + n.toLocaleString('en-US');
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

/* A stat is shown when it's a positive number, or a string placeholder such as "—" */
function hasStat(v) { return (typeof v === 'number' && v > 0) || (typeof v === 'string' && v.trim() !== ''); }
function fmtStat(v) { return typeof v === 'number' ? v.toLocaleString() : v; }

/* ---------- Render Property Card ---------- */
function renderPropertyCard(p, opts = {}) {
  const { hideBadge = false, hideRep = false, hidePrice = false, linkBase = 'property.html' } = opts;
  const parts = [
    hasStat(p.sqft) ? fmtStat(p.sqft) + ' sq.ft.' : '',
    hasStat(p.beds) ? fmtStat(p.beds) + ' BD' : '',
    hasStat(p.baths) ? fmtStat(p.baths) + ' BA' : ''
  ].filter(Boolean);
  const specs = parts.length
    ? parts.join(' <span>·</span> ')
    : '<em style="opacity:0.7;">Details available upon request</em>';
  return `
    <a class="property-card" href="${linkBase}?id=${p.id}">
      <div class="property-photo">
        ${hideBadge ? '' : `<span class="property-badge ${statusClass(p.status)}">${p.status}</span>`}
        <img src="${p.image}" alt="${p.address}" loading="lazy" onerror="this.src='images/placeholder.svg'">
      </div>
      <div class="property-address">${p.address}</div>
      <div class="property-specs">${p.subtitle ? p.subtitle : specs}</div>
      <div class="property-specs" style="font-size:12px;">${p.city}</div>
      ${!hidePrice && p.price > 0 ? `<div class="property-price">${formatPrice(p.price)}</div>` : ''}
      ${hideRep || !p.representation ? '' : `<div class="property-rep">${p.representation}</div>`}
    </a>
  `;
}

/* ---------- Load and render properties ---------- */
async function loadProperties() {
  try {
    const res = await fetch('data/properties.json');
    return await res.json();
  } catch (e) {
    console.error('Failed to load properties.json', e);
    return { properties: [], developments: [] };
  }
}

async function renderPropertiesGrid(targetSel) {
  const data = await loadProperties();
  const el = document.querySelector(targetSel);
  if (!el) return;
  el.innerHTML = data.properties.map(p => renderPropertyCard(p)).join('');
}

async function renderDevelopmentsGrid(targetSel) {
  const data = await loadProperties();
  const el = document.querySelector(targetSel);
  if (!el) return;
  el.innerHTML = data.developments.map(p =>
    renderPropertyCard(p, { hideBadge: true, hideRep: true, hidePrice: true, linkBase: 'development.html' })
  ).join('');
}

async function renderPropertiesCarousel(targetSel) {
  const data = await loadProperties();
  const el = document.querySelector(targetSel);
  if (!el) return;
  el.innerHTML = data.properties.slice(0, 12).map(p => `
    <div class="carousel-item">${renderPropertyCard(p)}</div>
  `).join('');
}

/* ---------- Render single property detail page ---------- */
async function renderPropertyDetail(devMode = false) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const data = await loadProperties();
  const list = devMode ? data.developments : data.properties;
  const p = list.find(x => x.id === id) || list[0];
  if (!p) return;

  const backHref = devMode ? 'developments.html' : 'properties.html';
  const backLabel = devMode ? 'All Developments' : 'All Properties';

  const target = document.querySelector('#property-detail');
  if (!target) return;

  const specs = `${p.sqft.toLocaleString()} sq.ft. · ${p.beds} Bed · ${p.baths} Bath`;
  const gallery = (p.gallery || [p.image]).map(src =>
    `<div><img src="${src}" alt="${p.address}" loading="lazy" onerror="this.src='images/placeholder.svg'"></div>`
  ).join('');

  target.innerHTML = `
    <a href="${backHref}" class="back-link">← ${backLabel}</a>

    <div class="property-hero">
      <div class="property-hero-main">
        <img src="${p.image}" alt="${p.address}" onerror="this.src='images/placeholder.svg'">
      </div>
      <div class="property-gallery">${gallery}</div>
      ${p.video ? `<div class="property-video">
        <video src="${p.video}" ${p.video_poster ? `poster="${p.video_poster}"` : ''} controls playsinline preload="none"></video>
      </div>` : ''}
    </div>

    <div class="property-detail-info">
      <div>
        ${devMode ? '' : `<div class="eyebrow">${p.status}</div>`}
        <h1 class="h-section" style="margin-bottom:8px;">${p.address}</h1>
        ${p.subtitle ? `<p class="body-text" style="margin-bottom:6px;font-size:17px;">${p.subtitle}</p>` : ''}
        <p class="body-text" style="margin-bottom:30px;">${p.city}</p>
        <p class="body-text" style="font-size:17px;">${p.description}</p>
      </div>
      <aside class="property-detail-sidebar">
        <dl>
          ${hasStat(p.sqft) ? `<div>
            <dt>Square Footage</dt>
            <dd>${fmtStat(p.sqft)}</dd>
          </div>` : ''}
          ${hasStat(p.beds) ? `<div>
            <dt>Bedrooms</dt>
            <dd>${p.beds}</dd>
          </div>` : ''}
          ${hasStat(p.baths) ? `<div>
            <dt>Bathrooms</dt>
            <dd>${p.baths}</dd>
          </div>` : ''}
          ${!devMode && p.price ? `<div>
            <dt>Price</dt>
            <dd>${formatPrice(p.price)}</dd>
          </div>` : ''}
          ${!devMode && p.representation ? `<div>
            <dt>Representation</dt>
            <dd style="font-size:16px;">${p.representation}</dd>
          </div>` : ''}
        </dl>
      </aside>
    </div>
  `;
  const place = (p.city || '').replace(/,?\s*CA\s*\d{5}$/, '').trim();
  document.title = `${p.address}${place ? ', ' + place : ''} | Erik Altman Marin Real Estate`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && p.description) metaDesc.setAttribute('content', p.description.slice(0, 155));
  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.append(canon); }
  canon.href = `https://erikaltman.com/${devMode ? 'development' : 'property'}?id=${encodeURIComponent(p.id)}`;

  initLightbox(target, p);
}

/* ---------- Photo lightbox (property & development detail pages) ---------- */
function initLightbox(root, p) {
  const photos = [...new Set([p.image, ...(p.gallery || [])].filter(Boolean))];
  if (!photos.length) return;

  let box = document.querySelector('.lightbox');
  if (!box) {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo gallery');
    box.hidden = true;
    box.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous photo">&#8249;</button>
      <figure class="lightbox-stage"><img alt=""></figure>
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Next photo">&#8250;</button>
      <div class="lightbox-count"></div>`;
    document.body.append(box);
  }
  const img = box.querySelector('img');
  const count = box.querySelector('.lightbox-count');
  const multi = photos.length > 1;
  box.querySelectorAll('.lightbox-nav').forEach(b => { b.hidden = !multi; });
  let idx = 0, lastFocus = null;

  const show = (i) => {
    idx = (i + photos.length) % photos.length;
    img.src = photos[idx];
    img.alt = `${p.address} — photo ${idx + 1} of ${photos.length}`;
    count.textContent = multi ? `${idx + 1} / ${photos.length}` : '';
    [idx + 1, idx - 1].forEach(j => { const pre = new Image(); pre.src = photos[(j + photos.length) % photos.length]; });
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox-close').focus();
  };
  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  box.onclick = (e) => {
    if (e.target.closest('.lightbox-prev')) return show(idx - 1);
    if (e.target.closest('.lightbox-next')) return show(idx + 1);
    if (e.target.closest('.lightbox-close') || !e.target.closest('img')) close();
  };
  box.onkeydown = null;
  document.removeEventListener('keydown', box._keys || (() => {}));
  box._keys = (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  };
  document.addEventListener('keydown', box._keys);

  let startX = null;
  box.ontouchstart = (e) => { startX = e.touches[0].clientX; };
  box.ontouchend = (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  };

  root.querySelectorAll('.property-hero-main img, .property-gallery img').forEach(el => {
    const i = Math.max(0, photos.indexOf(el.getAttribute('src')));
    el.style.cursor = 'zoom-in';
    el.tabIndex = 0;
    el.addEventListener('click', () => open(i));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
}
