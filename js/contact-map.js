/* ============================================================
   Contact page map: Boulevard-styled map of every sale and listing.

   Built on MapLibre (open source) with free OpenFreeMap tiles, so it
   needs no API key and no billing. Pins come from data/properties.json:
   any property with "lat" and "lng" is plotted. SOLD shows in slate;
   anything else (Active, Pending, Coming Soon...) shows in green.
   Units at the same address share one pin.
   ============================================================ */
(function () {
  const box = document.getElementById('contact-map');
  if (!box || typeof maplibregl === 'undefined') return;

  // Boulevard palette
  const C = {
    limestone: '#EFE8DC', deep: '#E5DCCB', paper: '#F7F2E8',
    slate: '#3A4248', slateSoft: '#5B6469', canopy: '#455444',
    brick: '#B05A3C', brickSoft: '#D08A6C', brickPale: '#E7C3AE',
    park: '#D7D9C4', water: '#C5CDCC', hair: '#D9CFBD'
  };

  // Office (Erik Altman Properties Google listing)
  const OFFICE = { lat: 37.9522009, lng: -122.549927 };
  const OFFICE_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJsU1W-oR5OakR91dSJVthaXY';

  const FONT = ['Noto Sans Regular'];
  const FONT_IT = ['Noto Sans Italic'];

  const style = {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': C.limestone } },
      { id: 'landcover-wood', type: 'fill', source: 'omt', 'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'farmland']]],
        paint: { 'fill-color': C.deep, 'fill-opacity': 0.7 } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park, 'fill-opacity': 0.8 } },
      { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['school', 'hospital', 'cemetery', 'stadium', 'pitch']]],
        paint: { 'fill-color': C.deep } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
      { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway',
        paint: { 'line-color': C.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 2.5] } },
      { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14,
        paint: { 'fill-color': C.deep, 'fill-outline-color': C.hair } },
      { id: 'boundary', type: 'line', source: 'omt', 'source-layer': 'boundary',
        filter: ['<=', ['get', 'admin_level'], 6],
        paint: { 'line-color': C.hair, 'line-width': 1, 'line-dasharray': [3, 2] } },

      // Roads: minor in paper, collector roads in pale brick, arterials and highways in canyon brick
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.paper, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 12, 0.5, 18, 12] } },
      { id: 'road-secondary', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['secondary', 'tertiary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.brickPale, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 9, 0.6, 18, 16] } },
      { id: 'road-primary', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['primary', 'trunk']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.brickSoft, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.8, 18, 20] } },
      { id: 'road-motorway', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'motorway'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': C.brick, 'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 1, 18, 24] } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'rail'],
        paint: { 'line-color': C.hair, 'line-width': 1 } },

      // Labels
      { id: 'water-name', type: 'symbol', source: 'omt', 'source-layer': 'water_name',
        layout: { 'text-field': ['get', 'name'], 'text-font': FONT_IT, 'text-size': 12 },
        paint: { 'text-color': C.slateSoft, 'text-halo-color': C.water, 'text-halo-width': 1 } },
      { id: 'road-name', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 13,
        layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 11 },
        paint: { 'text-color': C.slateSoft, 'text-halo-color': C.paper, 'text-halo-width': 1.5 } },
      { id: 'place-name', type: 'symbol', source: 'omt', 'source-layer': 'place',
        filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'village', 'suburb', 'neighbourhood']]],
        layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-transform': 'uppercase',
                  'text-letter-spacing': 0.15,
                  'text-size': ['match', ['get', 'class'], ['city', 'town'], 13, 11] },
        paint: { 'text-color': C.slate, 'text-halo-color': C.limestone, 'text-halo-width': 2 } }
    ]
  };

  const map = new maplibregl.Map({
    container: box,
    style,
    center: [OFFICE.lng, OFFICE.lat],
    zoom: 11,
    cooperativeGestures: true,
    attributionControl: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }));

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  function pin(kind) {
    const n = el('div', 'map-pin map-pin--' + kind);
    return n;
  }

  function popupFor(group) {
    const first = group[0];
    const wrap = el('div', 'map-pop');
    if (first.image) {
      const img = el('img', 'map-pop-img');
      img.src = first.image; img.alt = first.address; img.loading = 'lazy';
      img.onerror = () => img.remove();
      wrap.append(img);
    }
    const body = el('div', 'map-pop-body');
    if (group.length > 1) {
      const base = first.address.replace(/\s*#.*$/, '');
      body.append(el('div', 'map-pop-status', group.length + ' units · ' + first.status));
      body.append(el('div', 'map-pop-addr', base));
      body.append(el('div', 'map-pop-city', first.city));
      const list = el('div', 'map-pop-units');
      group.forEach(p => {
        const a = el('a', null, (p.address.match(/#\S+/) || [p.address])[0]);
        a.href = 'property.html?id=' + encodeURIComponent(p.id);
        list.append(a);
      });
      body.append(list);
    } else {
      body.append(el('div', 'map-pop-status', first.status));
      body.append(el('div', 'map-pop-addr', first.address));
      body.append(el('div', 'map-pop-city', first.city));
      if (first.representation) body.append(el('div', 'map-pop-rep', first.representation));
      const a = el('a', 'map-pop-link', 'View property →');
      a.href = 'property.html?id=' + encodeURIComponent(first.id);
      body.append(a);
    }
    wrap.append(body);
    return new maplibregl.Popup({ offset: 14, closeButton: true, maxWidth: '260px', focusAfterOpen: false }).setDOMContent(wrap);
  }

  // Office pin
  const officePop = el('div', 'map-pop');
  const ob = el('div', 'map-pop-body');
  ob.append(el('div', 'map-pop-status', 'Office'));
  ob.append(el('div', 'map-pop-addr', 'Erik Altman Properties'));
  const ol = el('a', 'map-pop-link', 'Open in Google Maps →'); ol.href = OFFICE_URL; ol.target = '_blank'; ol.rel = 'noopener';
  ob.append(ol); officePop.append(ob);
  const officeEl = el('div', 'map-pin map-pin--office');
  const mark = el('img'); mark.src = 'images/blvd-mark.svg'; mark.alt = '';
  officeEl.append(mark);
  new maplibregl.Marker({ element: officeEl })
    .setLngLat([OFFICE.lng, OFFICE.lat])
    .setPopup(new maplibregl.Popup({ offset: 20, maxWidth: '260px', focusAfterOpen: false }).setDOMContent(officePop))
    .addTo(map);

  fetch('data/properties.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(data => {
      const props = (data.properties || []).filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
      const groups = new Map();
      props.forEach(p => {
        const key = p.lat.toFixed(5) + ',' + p.lng.toFixed(5);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(p);
      });
      const bounds = new maplibregl.LngLatBounds([OFFICE.lng, OFFICE.lat], [OFFICE.lng, OFFICE.lat]);
      groups.forEach(group => {
        const p = group[0];
        const kind = (p.status || '').toUpperCase() === 'SOLD' ? 'sold' : 'active';
        const node = pin(kind);
        if (group.length > 1) node.append(el('span', 'map-pin-count', String(group.length)));
        node.title = group.length > 1 ? p.address.replace(/\s*#.*$/, '') : p.address;
        new maplibregl.Marker({ element: node }).setLngLat([p.lng, p.lat]).setPopup(popupFor(group)).addTo(map);
        bounds.extend([p.lng, p.lat]);
      });
      map.fitBounds(bounds, { padding: 50, maxZoom: 13, duration: 0 });
    })
    .catch(e => console.warn('Could not load properties for map:', e));
})();
