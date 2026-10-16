"use client";

// Google Map of directory businesses: branded pins, marker clustering, an
// optional "search near" centre + radius circle, and a React-rendered preview
// card for the selected business. Business data is only ever written to the
// map through DOM properties (never HTML strings).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Loader2,
  MapPin,
  MapPinOff,
  Maximize2,
  Navigation,
  X,
} from "lucide-react";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";
import BusinessLogo from "./BusinessLogo";
import {
  formatPromotions,
  getDirectionsUrl,
  getInitial,
  type MappableBusiness,
} from "./types";
import {
  formatDistance,
  milesToMeters,
  radiusBounds,
  type LatLng,
  type SearchCenter,
} from "./geo";

export interface MapSearchArea {
  center: SearchCenter;
  radiusMiles: number | null;
}

const BRAND = "#dc2626"; // tailwind red-600
const BRAND_DARK = "#991b1b"; // tailwind red-800
const CENTER_BLUE = "#2563eb"; // tailwind blue-600
const DEFAULT_CENTER = { lat: 39.5, lng: -98.35 }; // continental US
const DEFAULT_ZOOM = 4;
const FOCUS_ZOOM = 15;
const TIGHT_BOUNDS_DEGREES = 0.01;
const SELECTED_Z_INDEX = 999; // below clusters (1000 + count)

// Map IDs are hex strings. Advanced Markers need a real one; anything else
// (e.g. an API key pasted by mistake) falls back to classic markers.
const RAW_MAP_ID = (process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "").trim();
const MAP_ID = /^[0-9a-f]{8,64}$/i.test(RAW_MAP_ID) ? RAW_MAP_ID : "";

// Only applies without a Map ID: hide Google's own business pins so ours
// stand out. (With a Map ID, styling is managed in Google Cloud.)
// Night palette matching the app (used when no cloud Map ID is configured).
const FALLBACK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0e1631" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#97a3cc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#070c20" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a3768" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2550" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3b3a52" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050918" }] },
];

interface MarkerEntry {
  marker: any;
  setSelected: (selected: boolean) => void;
}

const svgUrl = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

// ---- Classic markers (no Map ID) ------------------------------------------

const PIN_W = 40;
const PIN_H = 52;

const pinSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W}" height="${PIN_H}" viewBox="0 0 ${PIN_W} ${PIN_H}">` +
  `<path d="M20 2C10.06 2 2 10.06 2 20c0 13.5 18 30 18 30s18-16.5 18-30C38 10.06 29.94 2 20 2z" fill="${fill}" stroke="#ffffff" stroke-width="3"/>` +
  `<circle cx="20" cy="20" r="11" fill="#ffffff"/></svg>`;

const PIN_URLS = { normal: svgUrl(pinSvg(BRAND)), selected: svgUrl(pinSvg(BRAND_DARK)) };

const classicIcon = (g: any, selected: boolean) => {
  const w = selected ? 40 : 32;
  const h = Math.round((w * PIN_H) / PIN_W);
  return {
    url: selected ? PIN_URLS.selected : PIN_URLS.normal,
    scaledSize: new g.Size(w, h),
    anchor: new g.Point(w / 2, (h * 50) / PIN_H),
    labelOrigin: new g.Point(w / 2, (h * 20) / PIN_H),
  };
};

const classicLabel = (business: MappableBusiness, selected: boolean) => ({
  text: getInitial(business.name),
  color: selected ? BRAND_DARK : BRAND,
  fontSize: selected ? "14px" : "12px",
  fontWeight: "700",
});

// ---- Advanced markers (Map ID configured) ---------------------------------

const buildPinElement = (business: MappableBusiness) => {
  const root = document.createElement("div");
  root.style.cssText =
    "display:flex;flex-direction:column;align-items:center;cursor:pointer;" +
    "transition:transform 150ms ease;transform-origin:bottom center;";

  const badge = document.createElement("div");
  badge.style.cssText =
    `width:36px;height:36px;border-radius:9999px;background:#fff;border:3px solid ${BRAND};` +
    "box-shadow:0 4px 10px rgba(15,23,42,.25);display:flex;align-items:center;" +
    `justify-content:center;overflow:hidden;font:700 14px/1 system-ui,sans-serif;color:${BRAND};`;

  const showInitial = () => {
    badge.textContent = getInitial(business.name);
  };
  if (business.logoUrl) {
    const img = document.createElement("img");
    img.src = business.logoUrl;
    img.alt = "";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    img.onerror = showInitial;
    badge.appendChild(img);
  } else {
    showInitial();
  }

  const tip = document.createElement("div");
  tip.style.cssText =
    "width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;" +
    `border-top:9px solid ${BRAND};margin-top:-1px;`;

  root.append(badge, tip);
  return { root, badge, tip };
};

// ---- Marker adapter -------------------------------------------------------

const createMarker = (
  g: any,
  business: MappableBusiness,
  useAdvanced: boolean,
  onClick: () => void,
): MarkerEntry => {
  const position = { lat: business.lat, lng: business.lng };

  if (useAdvanced) {
    const { root, badge, tip } = buildPinElement(business);
    const marker = new g.marker.AdvancedMarkerElement({
      position,
      content: root,
      title: business.name,
    });
    marker.addListener("click", onClick);
    return {
      marker,
      setSelected: (selected) => {
        const color = selected ? BRAND_DARK : BRAND;
        root.style.transform = selected ? "scale(1.25)" : "scale(1)";
        badge.style.borderColor = color;
        tip.style.borderTopColor = color;
        marker.zIndex = selected ? SELECTED_Z_INDEX : null;
      },
    };
  }

  const marker = new g.Marker({
    position,
    title: business.name,
    icon: classicIcon(g, false),
    label: classicLabel(business, false),
  });
  marker.addListener("click", onClick);
  return {
    marker,
    setSelected: (selected) => {
      marker.setIcon(classicIcon(g, selected));
      marker.setLabel(classicLabel(business, selected));
      marker.setZIndex(selected ? SELECTED_Z_INDEX : undefined);
    },
  };
};

const createClusterRenderer = (g: any, useAdvanced: boolean) => ({
  render: ({ count, position }: { count: number; position: any }) => {
    const size = count < 10 ? 40 : count < 100 ? 48 : 56;
    const title = `${count} businesses — click to zoom in`;
    const zIndex = 1000 + count;

    if (useAdvanced) {
      const el = document.createElement("div");
      el.style.cssText =
        `width:${size}px;height:${size}px;border-radius:9999px;background:${BRAND};color:#fff;` +
        "display:flex;align-items:center;justify-content:center;font:700 13px/1 system-ui,sans-serif;" +
        "box-shadow:0 0 0 6px rgba(220,38,38,.25),0 4px 10px rgba(15,23,42,.25);" +
        "transform:translateY(50%);cursor:pointer;";
      el.textContent = String(count);
      return new g.marker.AdvancedMarkerElement({ position, content: el, title, zIndex });
    }

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">` +
      `<circle cx="30" cy="30" r="29" fill="${BRAND}" fill-opacity=".22"/>` +
      `<circle cx="30" cy="30" r="22" fill="${BRAND}"/></svg>`;
    return new g.Marker({
      position,
      title,
      zIndex,
      icon: {
        url: svgUrl(svg),
        scaledSize: new g.Size(size, size),
        anchor: new g.Point(size / 2, size / 2),
      },
      label: { text: String(count), color: "#ffffff", fontSize: "13px", fontWeight: "700" },
    });
  },
});

const fitToBusinesses = (g: any, map: any, businesses: MappableBusiness[]) => {
  if (businesses.length === 0) {
    map.setCenter(DEFAULT_CENTER);
    map.setZoom(DEFAULT_ZOOM);
    return;
  }
  if (businesses.length === 1) {
    map.setCenter({ lat: businesses[0].lat, lng: businesses[0].lng });
    map.setZoom(FOCUS_ZOOM - 1);
    return;
  }
  const bounds = new g.LatLngBounds();
  businesses.forEach((b) => bounds.extend({ lat: b.lat, lng: b.lng }));
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  // Pins within ~1 km (e.g. one shared address): fitBounds would zoom to
  // street level, so centre on them at a readable zoom instead.
  if (
    Math.abs(ne.lat() - sw.lat()) < TIGHT_BOUNDS_DEGREES &&
    Math.abs(ne.lng() - sw.lng()) < TIGHT_BOUNDS_DEGREES
  ) {
    map.setCenter(bounds.getCenter());
    map.setZoom(FOCUS_ZOOM);
    return;
  }
  map.fitBounds(bounds, 56);
};

// With a radius, frame the search circle; otherwise frame the pins.
const fitView = (
  g: any,
  map: any,
  businesses: MappableBusiness[],
  area: MapSearchArea | null,
) => {
  if (area?.radiusMiles) {
    map.fitBounds(radiusBounds(area.center, area.radiusMiles), 16);
    return;
  }
  fitToBusinesses(g, map, businesses);
};

// ---- Search centre ("you are here") marker --------------------------------

const CENTER_DOT_SIZE = 18;

const createCenterMarker = (g: any, position: LatLng, useAdvanced: boolean) => {
  const title = "Search location";
  if (useAdvanced) {
    const dot = document.createElement("div");
    dot.style.cssText =
      `width:${CENTER_DOT_SIZE}px;height:${CENTER_DOT_SIZE}px;border-radius:9999px;` +
      `background:${CENTER_BLUE};border:3px solid #fff;transform:translateY(50%);` +
      "box-shadow:0 0 0 6px rgba(37,99,235,.2),0 2px 6px rgba(15,23,42,.3);";
    return new g.marker.AdvancedMarkerElement({ position, content: dot, title, zIndex: 0 });
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">` +
    `<circle cx="15" cy="15" r="14" fill="${CENTER_BLUE}" fill-opacity=".2"/>` +
    `<circle cx="15" cy="15" r="8" fill="${CENTER_BLUE}" stroke="#fff" stroke-width="3"/></svg>`;
  const size = 30;
  return new g.Marker({
    position,
    title,
    clickable: false,
    zIndex: 0,
    icon: {
      url: svgUrl(svg),
      scaledSize: new g.Size(size, size),
      anchor: new g.Point(size / 2, size / 2),
    },
  });
};

const setMarkerPosition = (marker: any, position: LatLng) => {
  if (typeof marker.setPosition === "function") marker.setPosition(position);
  else marker.position = position;
};

const detachMarker = (marker: any) => {
  if (!marker) return;
  if (typeof marker.setMap === "function") marker.setMap(null);
  else marker.map = null;
};

// ---- Component ------------------------------------------------------------

interface BusinessDirectoryMapProps {
  businesses: MappableBusiness[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  searchArea?: MapSearchArea | null;
  className?: string;
}

const BusinessDirectoryMap = ({
  businesses,
  selectedId,
  onSelect,
  searchArea = null,
  className = "",
}: BusinessDirectoryMapProps) => {
  const mapsState = useGoogleMapsScript();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const markersRef = useRef(new Map<string, MarkerEntry>());
  const circleRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const searchAreaRef = useRef<MapSearchArea | null>(searchArea);
  const [mapReady, setMapReady] = useState(false);

  // Map/marker listeners are created once; they read the latest values here.
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  const prevSelectedRef = useRef<string | null>(null);
  const selectedFromMapRef = useRef(false);

  const businessesRef = useRef(businesses);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    businessesRef.current = businesses;
  }, [businesses]);

  useEffect(() => {
    searchAreaRef.current = searchArea;
  }, [searchArea]);

  const selected = useMemo(
    () => businesses.find((b) => b.id === selectedId) || null,
    [businesses, selectedId],
  );

  useEffect(() => {
    if (mapsState.status === "error") {
      console.warn("Business directory map unavailable:", mapsState.error);
    }
  }, [mapsState]);

  // 1. Create the map once the Maps script is ready.
  useEffect(() => {
    if (mapsState.status !== "ready" || !containerRef.current || mapRef.current) {
      return;
    }
    const g = window.google.maps;
    const map = new g.Map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      ...(MAP_ID ? { mapId: MAP_ID } : { styles: FALLBACK_STYLES }),
      // Dark basemap to match the app (cloud-styled maps use their dark variant).
      colorScheme: g.ColorScheme?.DARK ?? "DARK",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      clickableIcons: false,
      gestureHandling: "cooperative",
    });
    map.addListener("click", () => onSelectRef.current(null));
    mapRef.current = map;
    setMapReady(true);
  }, [mapsState.status]);

  // 2. (Re)build markers whenever the visible businesses change.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;
    const g = window.google.maps;
    const map = mapRef.current;
    const useAdvanced = Boolean(MAP_ID && g.marker?.AdvancedMarkerElement);

    import("@googlemaps/markerclusterer")
      .then(({ MarkerClusterer }) => {
        if (cancelled || mapRef.current !== map) return;

        if (!clustererRef.current) {
          clustererRef.current = new MarkerClusterer({
            map,
            renderer: createClusterRenderer(g, useAdvanced),
          });
        }
        const clusterer = clustererRef.current;

        const oldMarkers = Array.from(markersRef.current.values(), (e) => e.marker);
        if (oldMarkers.length) clusterer.removeMarkers(oldMarkers, true);
        markersRef.current.clear();

        const markers = businesses.map((business) => {
          const entry = createMarker(g, business, useAdvanced, () => {
            // Only flag real changes; re-clicking the selected pin triggers no
            // selection effect, so the flag would leak into the next selection.
            if (business.id === selectedIdRef.current) return;
            selectedFromMapRef.current = true;
            onSelectRef.current(business.id);
          });
          if (business.id === selectedIdRef.current) entry.setSelected(true);
          markersRef.current.set(business.id, entry);
          return entry.marker;
        });
        clusterer.addMarkers(markers);
        // The parent recomputes `businesses` whenever the search area changes,
        // so this also reframes the map for a new centre/radius.
        fitView(g, map, businesses, searchAreaRef.current);
      })
      .catch((error) => console.error("Failed to load marker clustering:", error));

    return () => {
      cancelled = true;
    };
  }, [businesses, mapReady]);

  // 2b. Draw the search centre and radius circle.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const g = window.google.maps;
    const map = mapRef.current;

    if (!searchArea) {
      detachMarker(centerMarkerRef.current);
      centerMarkerRef.current = null;
      circleRef.current?.setMap(null);
      circleRef.current = null;
      return;
    }

    const position = { lat: searchArea.center.lat, lng: searchArea.center.lng };
    if (centerMarkerRef.current) {
      setMarkerPosition(centerMarkerRef.current, position);
    } else {
      const useAdvanced = Boolean(MAP_ID && g.marker?.AdvancedMarkerElement);
      centerMarkerRef.current = createCenterMarker(g, position, useAdvanced);
      if (useAdvanced) centerMarkerRef.current.map = map;
      else centerMarkerRef.current.setMap(map);
    }

    if (!searchArea.radiusMiles) {
      circleRef.current?.setMap(null);
      circleRef.current = null;
      return;
    }
    const radius = milesToMeters(searchArea.radiusMiles);
    if (circleRef.current) {
      circleRef.current.setCenter(position);
      circleRef.current.setRadius(radius);
    } else {
      circleRef.current = new g.Circle({
        map,
        center: position,
        radius,
        clickable: false, // map clicks still clear the selection
        strokeColor: BRAND,
        strokeOpacity: 0.7,
        strokeWeight: 1.5,
        fillColor: BRAND,
        fillOpacity: 0.06,
      });
    }
  }, [searchArea, mapReady]);

  // 3. Reflect selection on the pins and bring the selected one into view.
  useEffect(() => {
    selectedIdRef.current = selectedId;
    const fromMap = selectedFromMapRef.current;
    selectedFromMapRef.current = false;

    const prevId = prevSelectedRef.current;
    if (prevId && prevId !== selectedId) {
      markersRef.current.get(prevId)?.setSelected(false);
    }
    prevSelectedRef.current = selectedId;
    if (!selectedId) return;

    markersRef.current.get(selectedId)?.setSelected(true);

    const map = mapRef.current;
    const target = businessesRef.current.find((b) => b.id === selectedId);
    if (!map || !target) return;
    map.panTo({ lat: target.lat, lng: target.lng });
    // Picking from the list zooms in (also breaks the pin out of a cluster);
    // clicking a pin keeps the user's zoom level.
    if (!fromMap && (map.getZoom() ?? 0) < FOCUS_ZOOM) map.setZoom(FOCUS_ZOOM);
  }, [selectedId, mapReady]);

  // Tear down on unmount.
  useEffect(() => {
    const markers = markersRef.current;
    return () => {
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
      markers.clear();
      // Null these too: a remount (e.g. React Strict Mode) creates a new map.
      detachMarker(centerMarkerRef.current);
      centerMarkerRef.current = null;
      circleRef.current?.setMap(null);
      circleRef.current = null;
      if (mapRef.current) window.google?.maps?.event?.clearInstanceListeners(mapRef.current);
      mapRef.current = null;
    };
  }, []);

  const showAll = useCallback(() => {
    if (!mapRef.current) return;
    onSelectRef.current(null);
    fitView(window.google.maps, mapRef.current, businesses, searchAreaRef.current);
  }, [businesses]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-secondary ${className}`}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        role="region"
        aria-label="Map of businesses"
      />

      {mapsState.status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary">
          <Loader2 className="h-7 w-7 animate-spin text-primary-light" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}

      {mapsState.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/40 px-6 text-center">
          <MapPinOff className="h-9 w-9 text-muted-foreground/60" />
          <p className="font-medium text-muted-foreground">Map unavailable</p>
          <p className="max-w-xs text-sm text-muted-foreground/80">
            We couldn&apos;t load the map right now. You can still browse every
            business in the list.
          </p>
        </div>
      )}

      {mapReady && businesses.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
          <p className="rounded-full bg-card/95 px-4 py-2 text-center text-sm text-muted-foreground shadow">
            {searchArea?.radiusMiles
              ? `No businesses within ${searchArea.radiusMiles} miles`
              : "No businesses with a map location match your search"}
          </p>
        </div>
      )}

      {mapReady && businesses.length > 1 && (
        <button
          type="button"
          onClick={showAll}
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-xs font-semibold text-foreground/85 shadow-md transition-colors hover:bg-accent/60 hover:text-primary-light"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Show all
        </button>
      )}

      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-10 sm:left-auto sm:w-80">
          <div className="relative rounded-2xl border border-border bg-popover p-4 shadow-xl">
            <button
              type="button"
              onClick={() => onSelect(null)}
              aria-label="Close preview"
              className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground/80 transition-colors hover:bg-accent hover:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pr-6">
              <BusinessLogo
                key={selected.id}
                name={selected.name}
                logoUrl={selected.logoUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate font-bold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="capitalize">{selected.businessType || "Business"}</span>
                  {typeof selected.distanceMiles === "number" &&
                    ` · ${formatDistance(selected.distanceMiles)} away`}
                </p>
              </div>
            </div>

            {selected.businessAddress && (
              <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                <span className="line-clamp-2">{selected.businessAddress}</span>
              </p>
            )}

            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-gold">
              <Gift className="h-4 w-4" />
              {formatPromotions(selected.activePromotions)}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/business/${selected.id}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
              >
                View business
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={getDirectionsUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground/85 transition-colors hover:bg-accent/60"
              >
                <Navigation className="h-4 w-4" />
                Directions
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDirectoryMap;
