/* ============================================================
   Contact page map, styled in the Boulevard palette.

   Uses the same browser key as js/reviews.js (restricted to
   erikaltman.com). If Google's script fails to load, the plain
   Google embed already in the page stays in place as a fallback.
   ============================================================ */
(function () {
  const GOOGLE_MAPS_KEY = 'AIzaSyAwd3BZmpwI4WkLIssLC_kJV2Cb5YcYBGs';
  const PLACE_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJsU1W-oR5OakR91dSJVthaXY';

  const box = document.getElementById('contact-map');
  if (!box) return;
  const center = { lat: parseFloat(box.dataset.lat), lng: parseFloat(box.dataset.lng) };

  // Boulevard palette
  const LIMESTONE = '#EFE8DC', LIMESTONE_DEEP = '#E5DCCB', PAPER = '#F7F2E8',
        SLATE = '#3A4248', SLATE_SOFT = '#5B6469', CANOPY = '#455444', BRICK = '#B05A3C';

  const STYLE = [
    { elementType: 'geometry', stylers: [{ color: LIMESTONE }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: SLATE_SOFT }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: LIMESTONE }, { weight: 3 }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#C9BFAE' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: SLATE }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: LIMESTONE_DEEP }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D3D6C3' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: CANOPY }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: PAPER }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#DDD3C1' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E2CDBE' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#D2B6A2' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: SLATE_SOFT }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#C7CFCF' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: SLATE_SOFT }] }
  ];

  // Canyon-brick pin
  const PIN = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">' +
    '<path d="M17 1C8.2 1 1 8 1 16.8 1 28.5 17 45 17 45s16-16.5 16-28.2C33 8 25.8 1 17 1z" fill="' + BRICK + '" stroke="' + PAPER + '" stroke-width="2"/>' +
    '<circle cx="17" cy="17" r="5.5" fill="' + PAPER + '"/></svg>');

  window.__eaContactMapInit = function () {
    try {
      const map = new google.maps.Map(box, {
        center, zoom: 14, styles: STYLE,
        disableDefaultUI: true, zoomControl: true,
        scrollwheel: false, gestureHandling: 'cooperative',
        backgroundColor: LIMESTONE
      });
      const marker = new google.maps.Marker({
        position: center, map, title: 'Erik Altman Properties',
        icon: { url: PIN, scaledSize: new google.maps.Size(34, 46), anchor: new google.maps.Point(17, 45) }
      });
      marker.addListener('click', () => window.open(PLACE_URL, '_blank', 'noopener'));
    } catch (e) {
      console.warn('Styled map unavailable, keeping Google embed:', e);
    }
  };

  // If the key is rejected, Google calls this; the embed is still there underneath only if
  // we haven't replaced it yet, so restore it.
  const fallbackHTML = box.innerHTML;
  window.gm_authFailure = function () { box.innerHTML = fallbackHTML; };

  const s = document.createElement('script');
  s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_KEY) + '&v=weekly&callback=__eaContactMapInit';
  s.async = true;
  document.head.append(s);
})();
