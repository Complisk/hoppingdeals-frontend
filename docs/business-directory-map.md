# Business Directory — Map View (Design)

## 1. Requirements

**Functional**
- Show every active business that has a location as a pin on a map on
  `/hopping-deals-business-directory` (and the `/business-directory` alias).
- Clicking a pin shows a preview (logo, name, address, active deal count) with
  links to the business profile and to Google Maps directions.
- The list and the map stay in sync: selecting a card focuses its pin and vice
  versa. Search (name/address) and category filter apply to both.
- Businesses without coordinates still appear in the list (flagged "Not on map").
- The original card grid remains available as a "Grid" view.

**Non-functional**
- No extra backend round trips: the existing directory call returns coordinates.
- Map script loaded only once (existing `useGoogleMapsScript` singleton).
- Graceful degradation: if Google Maps fails to load (missing key, quota,
  ad-blocker), the list still works and the map panel shows a clear message.
- Readable with hundreds of nearby pins → marker clustering.
- Mobile: map stacks above the list; no horizontal scroll.

**Constraints / existing stack**
- Frontend: Next.js 16 (client view `src/views/CompliskBusinessDirectory.tsx`),
  Tailwind, Google Maps JS API key already configured
  (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
- Backend: Express + Sequelize + PostGIS. `Business.lat`, `Business.lng`
  (DOUBLE) and `Business.coordinates` (GEOGRAPHY POINT, GIST-indexed) are set at
  registration from Google Places and on profile update.

## 2. High-level design

```
Browser                                         Backend
───────                                         ───────
CompliskBusinessDirectory (view)
  │  fetch GET /api/business-directory  ───────▶ getBusinessDirectory
  │                                              Business.findAll(status=active,
  │◀──── { businesses:[{…, lat, lng}] } ───────   attrs incl. lat/lng)
  │                                              + Promotion COUNT GROUP BY
  ├─ filters (search, category) → filtered[]
  ├─ DirectoryList (compact cards)  ◀──┐ selectedId
  └─ BusinessDirectoryMap  ────────────┘
        useGoogleMapsScript (places,marker)
        google.maps.Map
        markers (Advanced or classic) → MarkerClusterer
        floating preview card (React)
```

**API contract** (additive, backwards compatible):

```jsonc
GET /api/business-directory
{
  "businesses": [
    {
      "id": "uuid", "name": "…", "logoUrl": "…|null",
      "businessType": "small", "businessAddress": "…|null",
      "categories": ["…"], "activePromotions": 2,
      "lat": 40.71,  // null when missing/invalid
      "lng": -74.0   // null when missing/invalid
    }
  ]
}
```

Coordinates are validated server-side (finite, within ±90/±180, not 0,0) so the
client never plots garbage.

## 3. Deep dive

- **Markers.** `AdvancedMarkerElement` requires a real Map ID. If
  `NEXT_PUBLIC_GOOGLE_MAP_ID` looks valid (it must not be an API key) we use
  Advanced Markers with HTML pins; otherwise we fall back to classic
  `google.maps.Marker` with an SVG icon plus a style that hides Google's own POI
  pins so ours stand out. Both paths go through one `createMarker` adapter.
- **Clustering.** `@googlemaps/markerclusterer` (declared dependency).
  Clicking a cluster zooms into it (library default).
- **Viewport.** On data/filter change the map fits bounds to the visible pins
  (one pin, or pins within ~1 km → centred at neighbourhood zoom instead of
  street level). Selecting from the list pans to the pin and zooms to ≥ 15;
  clicking a pin pans but keeps the user's zoom.
- **Preview card.** Rendered by React over the map (not an `InfoWindow` with
  HTML strings), so business names are never injected as HTML.
- **Radius search ("search near").** Visitors pick a centre — browser
  geolocation, the site-wide location saved by the header's "Set Location"
  (`localStorage.userLocation`, followed live via the `locationChanged` event;
  used as the default so there's no permission prompt on load), or any US
  address/city/ZIP via Places Autocomplete (session tokens + `fields:
  ["geometry"]` to keep billing minimal) — and a distance (5/10/25/50/100 mi).
  Distances are computed client-side with the haversine formula
  (`components/businessDirectory/geo.ts`) because the full list is already
  loaded; results sort nearest-first, and the map draws the centre dot and a
  `google.maps.Circle`, framing the circle's bounds. Businesses without
  coordinates are excluded while a radius is active. The directory's chosen
  centre is page-local and does not overwrite the visitor's saved location.
- **Caching.** Endpoint sends `Cache-Control: public, max-age=60,
  stale-while-revalidate=300`; the list changes rarely and is public.
- **Errors.** Fetch failure → error state with Retry. Map load failure → panel
  message; list still usable.

## 4. Scale

Payload ≈ 250 B per business → 1 000 businesses ≈ 250 KB uncompressed (~40 KB
gzipped). One indexed query + one grouped count. Fine into the low thousands.

## 5. Trade-offs

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Map provider | Google Maps JS | Leaflet + OSM tiles | Key + loader already in app; coords come from Google Places. Cost is per map load — loaded only in Map view. |
| Data delivery | Coordinates on existing endpoint | Separate `/map` or GeoJSON endpoint | One round trip, list and map share data. |
| Markers | Advanced w/ classic fallback | Classic only | Classic `Marker` is deprecated; fallback keeps it working until a Map ID is created. |
| Preview | React overlay card | `InfoWindow` | Styling consistency and no HTML-string XSS risk. |

## 6. Revisit as the system grows

- **> ~5 000 businesses:** switch to a viewport query
  (`?bbox=` → `ST_Intersects(coordinates, ST_MakeEnvelope(...))`, GIST index
  already exists) and paginate the list.
- **Server-side radius:** once the list is paginated, move the radius filter
  to the API (`?lat=&lng=&radius=` → `ST_DWithin(coordinates, point, meters)`
  ordered by `ST_Distance`; the GIST index already exists) so distance sorting
  stays correct across pages.
- **Map ID:** create a real Map ID in Google Cloud Console (Map Management) and
  set `NEXT_PUBLIC_GOOGLE_MAP_ID` to enable Advanced Markers and cloud styling.
- **Cost monitoring:** watch Maps JavaScript API loads in Google Cloud billing.
