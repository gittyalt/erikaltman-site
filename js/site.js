/* ============================================================
   ERIK ALTMAN — Site JavaScript
   ============================================================ */

/* ---------- Mobile Nav Toggle ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
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

/* ---------- Render Property Card ---------- */
function renderPropertyCard(p, opts = {}) {
  const { hideBadge = false, hideRep = false, hidePrice = false, linkBase = 'property.html' } = opts;
  const hasSpecs = p.sqft > 0 || p.beds > 0 || p.baths > 0;
  const specs = hasSpecs
    ? `${p.sqft > 0 ? p.sqft.toLocaleString() + ' sq.ft.' : ''}${p.sqft > 0 && p.beds > 0 ? ' <span>·</span> ' : ''}${p.beds > 0 ? p.beds + ' BD' : ''}${p.beds > 0 && p.baths > 0 ? ' <span>·</span> ' : ''}${p.baths > 0 ? p.baths + ' BA' : ''}`
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
          ${p.sqft > 0 ? `<div>
            <dt>Square Footage</dt>
            <dd>${p.sqft.toLocaleString()}</dd>
          </div>` : ''}
          ${p.beds > 0 ? `<div>
            <dt>Bedrooms</dt>
            <dd>${p.beds}</dd>
          </div>` : ''}
          ${p.baths > 0 ? `<div>
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
  document.title = `${p.address} — Erik Altman`;
}
