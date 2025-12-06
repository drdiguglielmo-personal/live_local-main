// Student B - adding mapbox service so that users can view business locations on a map as well as add locations when they use the "Apply" tab to add a business to the map 
import React from 'react';
import { getAllBusinesses } from '../../services/businessService';
import './MapboxMap.css';
import Parse from '../../services/parseService.js';

// Mapbox config
const MAPBOX_TOKEN = 'pk.eyJ1Ijoibm5vcnRvbjIiLCJhIjoiY21odmFlbnZhMDhrZzJscHR1aTI5NXg4ayJ9.4DRkLwbY1f5Zn9peShYHPw';
const MAPBOX_JS = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js';
const MAPBOX_CSS = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css';

function ensureMapboxAssets() {
  return new Promise((resolve, reject) => {
    try {
      if (window.mapboxgl) return resolve(window.mapboxgl);
      if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = MAPBOX_CSS;
        document.head.appendChild(link);
      }
      const script = document.createElement('script');
      script.src = MAPBOX_JS;
      script.async = true;
      script.onload = () => resolve(window.mapboxgl);
      script.onerror = reject;
      document.body.appendChild(script);
    } catch (e) {
      reject(e);
    }
  });
}

// Main map component - renders a sidebar with business listings and a mapbox map with markers
const MapboxMap = () => {
  const mapRef = React.useRef(null);
  // UI error if assets fail to load
  const [error, setError] = React.useState(null);
  // Business data used for listings and marker creation
  const [businesses, setBusinesses] = React.useState([]);
  const mapInstanceRef = React.useRef(null);
  // search bar within the map 
  const [search, setSearch] = React.useState('');
  const [noResult, setNoResult] = React.useState(false);

  const geocode = React.useCallback(async (query) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
      const res = await fetch(url);
      const json = await res.json();
      const f = json?.features?.[0];
      if (f && Array.isArray(f.center)) return f.center;
    } catch (_) {}
    return null;
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    const center = await geocode(q);
    if (center && mapInstanceRef.current) {
      setNoResult(false);
      try { mapInstanceRef.current.flyTo({ center, zoom: 13.5 }); } catch(_) {}
    } else {
      setNoResult(true);
    }
  };

  React.useEffect(() => {
    let map;
    let markers = [];
    let mounted = true;
    let didUserCenter = false;

    //  initialize the map, then fetch businesses and add markers
    ensureMapboxAssets()
      .then(async (mapboxgl) => {
        if (!mounted) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        // Create the map instance
        map = new mapboxgl.Map({
          container: mapRef.current,
          center: [-77.03915, 38.90025],
          zoom: 12.5,
          style: 'mapbox://styles/mapbox/streets-v12'
        });
        mapInstanceRef.current = map;

        // set start location - If the signed-in user has a location set in their profile, center/zoom to it
        try {
          const currentUser = Parse && Parse.User && typeof Parse.User.current === 'function' ? Parse.User.current() : null;
          const profileLoc = currentUser && (currentUser.get ? currentUser.get('location') : currentUser.location);
          if (profileLoc) {
            const userCenter = await geocode(profileLoc);
            if (mounted && userCenter) {
              try { map.flyTo({ center: userCenter, zoom: 13.5 }); didUserCenter = true; } catch (_) {}
            }
          }
        } catch (_) {}

        // Fetch businesses (Parse first, fallback to local JSON) and render list
        const list = await getAllBusinesses();
        if (!mounted) return;
        setBusinesses(list);

        const coords = [];
        // Create a marker and popup for each business
        for (const b of list) {
          const name = b.Name || 'Business';
          const addr = Array.isArray(b.Addresses) && b.Addresses.length ? b.Addresses[0] : (b.Address || null);
          if (!addr) continue;
          const center = await geocode(addr);
          if (!mounted || !center) continue;
          coords.push(center);
          const popup = new mapboxgl.Popup({ offset: 24 }).setHTML(`<strong>${name}</strong><br/>${addr}`);
          const m = new mapboxgl.Marker().setLngLat(center).setPopup(popup).addTo(map);
          markers.push(m);
        }

        // If we placed markers and we didn't already center on the user's location, fit map bounds to show all
        if (coords.length && !didUserCenter) {
          const bounds = new mapboxgl.LngLatBounds();
          coords.forEach((c) => bounds.extend(c));
          try { map.fitBounds(bounds, { padding: 60, maxZoom: 14 }); } catch(_) {}
        }
      })
      .catch((e) => setError(e?.message || 'Failed to load map'));

    // remove markers and map when component unmounts
    return () => {
      mounted = false;
      try { markers.forEach((m) => m.remove()); } catch(_) {}
      try { if (map) map.remove(); } catch(_) {}
      mapInstanceRef.current = null;
    };
  }, [geocode]);

// layout - sidebar (listings) + map container
  return (
    <div className="mapbox-wrapper">
      {error && (
        <div className="mapbox-error">Map failed to load: {error}</div>
      )}
      <aside className="mapbox-sidebar">
        <form onSubmit={onSearch} className="mapbox-search">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (noResult) setNoResult(false); }}
            placeholder="Enter a city here"
          />
          <button type="submit">Go</button>
        </form>
        {noResult && (
          <div className="mapbox-search__nores" aria-live="polite">No results found</div>
        )}
        {/* Listings header with count */}
        <h3>Local Businesses: {businesses.length}</h3>
        <div>
          {businesses.map((b, idx) => {
            const addr = Array.isArray(b.Addresses) && b.Addresses.length ? b.Addresses[0] : (b.Address || '');
            return (
              <div key={idx} className="mapbox-listing">
                <div className="name">{b.Name}</div>
                <div className="addr">{addr}</div>
              </div>
            );
          })}
        </div>
      </aside>
      <div className="mapbox-map">
        {/* Mapbox GL mounts into this div */}
        <div ref={mapRef} />
      </div>
    </div>
  );
};

export default MapboxMap;
