"use client";

// Business Directory — fetches active businesses (with active promotion
// counts and map coordinates) from the backend and shows them on a map with a
// synced list, or as the original responsive card grid. Visitors can search,
// filter by category, and limit results to a radius around a location.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/homePage/Header";
import { formatCategoryLabel } from "@/lib/deal";
import PageHero from "@/components/public/PageHero";
import Footer from "@/components/homePage/Footer";
import {
  MapPin,
  MapPinOff,
  Building2,
  Gift,
  ArrowRight,
  Loader2,
  Search,
  Map as MapIcon,
  LayoutGrid,
  RefreshCw,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BusinessDirectoryMap, {
  type MapSearchArea,
} from "@/components/businessDirectory/BusinessDirectoryMap";
import BusinessLogo from "@/components/businessDirectory/BusinessLogo";
import DirectoryLocationPicker from "@/components/businessDirectory/DirectoryLocationPicker";
import {
  type DirectoryBusiness,
  formatPromotions,
  isMappable,
} from "@/components/businessDirectory/types";
import {
  RADIUS_OPTIONS_MILES,
  distanceMiles,
  formatDistance,
  readSavedUserLocation,
  type SearchCenter,
} from "@/components/businessDirectory/geo";

type ViewMode = "map" | "grid";

const VIEW_OPTIONS: { id: ViewMode; label: string; Icon: typeof MapIcon }[] = [
  { id: "map", label: "Map", Icon: MapIcon },
  { id: "grid", label: "Grid", Icon: LayoutGrid },
];

const DESKTOP_QUERY = "(min-width: 1024px)";
const SEARCH_DEBOUNCE_MS = 250;

const getCategories = (business: DirectoryBusiness) =>
  Array.isArray(business.categories) ? business.categories.filter(Boolean) : [];

const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;

const hasDistance = (business: DirectoryBusiness) =>
  typeof business.distanceMiles === "number";

const DistanceTag = ({ business }: { business: DirectoryBusiness }) =>
  hasDistance(business) ? (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
      <Navigation className="h-3 w-3" />
      {formatDistance(business.distanceMiles as number)}
    </span>
  ) : null;

const CompliskBusinessDirectory = () => {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<ViewMode>("map");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [center, setCenter] = useState<SearchCenter | null>(null);
  const [radiusMiles, setRadiusMiles] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  const mapPanelRef = useRef<HTMLDivElement>(null);

  const loadBusinesses = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/business-directory`,
        { signal },
      );
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      setBusinesses(Array.isArray(data?.businesses) ? data.businesses : []);
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Failed to load business directory:", error);
      setLoadError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadBusinesses(controller.signal);
    return () => controller.abort();
  }, [loadBusinesses]);

  // Start from the location set in the site header (no permission prompt),
  // and follow it when the visitor changes it there.
  useEffect(() => {
    setCenter((current) => current ?? readSavedUserLocation());
    const handleLocationChanged = () => {
      const saved = readSavedUserLocation();
      if (saved) setCenter(saved);
    };
    window.addEventListener("locationChanged", handleLocationChanged);
    return () => window.removeEventListener("locationChanged", handleLocationChanged);
  }, []);

  // Debounce typing so the map isn't rebuilt and refitted on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(query),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const categories = useMemo(
    () =>
      Array.from(new Set(businesses.flatMap(getCategories))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [businesses],
  );

  const radiusActive = Boolean(center && radiusMiles);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    const results = businesses
      .map((business): DirectoryBusiness => ({
        ...business,
        distanceMiles:
          center && isMappable(business) ? distanceMiles(center, business) : null,
      }))
      .filter((business) => {
        if (radiusActive) {
          if (!hasDistance(business) || business.distanceMiles > radiusMiles) {
            return false;
          }
        }
        const cats = getCategories(business);
        if (category !== "all" && !cats.includes(category)) return false;
        if (!q) return true;
        return [business.name, business.businessAddress, ...cats].some(
          (value) => value && String(value).toLowerCase().includes(q),
        );
      });

    // Nearest first once a location is set; businesses without one go last.
    if (center) {
      results.sort((a, b) => {
        if (a.distanceMiles === null) return b.distanceMiles === null ? 0 : 1;
        if (b.distanceMiles === null) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
    }
    return results;
  }, [businesses, debouncedQuery, category, center, radiusMiles, radiusActive]);

  const mappable = useMemo(() => filtered.filter(isMappable), [filtered]);

  const searchArea = useMemo<MapSearchArea | null>(
    () => (center ? { center, radiusMiles: radiusActive ? radiusMiles : null } : null),
    [center, radiusMiles, radiusActive],
  );

  // Drop the selection when filters hide the selected business.
  useEffect(() => {
    if (selectedId && !mappable.some((b) => b.id === selectedId)) {
      setSelectedId(null);
    }
  }, [mappable, selectedId]);

  const hasFilters =
    query.trim() !== "" || category !== "all" || radiusMiles !== null;

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setCategory("all");
    setRadiusMiles(null);
  };

  const handleRadiusChange = (value: string) => {
    const next = value === "any" ? null : Number(value);
    setRadiusMiles(next);
    // A distance needs a starting point — ask for one.
    if (next && !center) setPickerOpen(true);
  };

  const nextRadius = radiusMiles
    ? RADIUS_OPTIONS_MILES.find((miles) => miles > radiusMiles)
    : undefined;

  // Pin clicked → keep its list card visible (desktop: list sits beside map).
  const handleMapSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id && isDesktop()) {
      cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  // Card clicked → focus its pin (mobile: map sits above the list).
  const handleCardSelect = (business: DirectoryBusiness) => {
    if (!isMappable(business)) {
      router.push(`/business/${business.id}`);
      return;
    }
    setSelectedId(business.id);
    if (!isDesktop()) {
      mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderNoMatches = () => (
    <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <Search className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <p className="mt-3 font-medium text-muted-foreground">
        {radiusActive
          ? `No businesses within ${radiusMiles} miles of ${center.label}`
          : "No businesses match your search"}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {radiusActive && nextRadius && (
          <button
            type="button"
            onClick={() => setRadiusMiles(nextRadius)}
            className="text-sm font-semibold text-primary-light hover:underline"
          >
            Search within {nextRadius} miles
          </button>
        )}
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground/85"
        >
          Clear filters
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
          <p className="text-sm text-muted-foreground">Loading businesses...</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 font-medium text-muted-foreground">
            We couldn&apos;t load the directory
          </p>
          <p className="text-sm text-muted-foreground/80">
            Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => loadBusinesses()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      );
    }

    if (businesses.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-3 font-medium text-muted-foreground">
            No businesses listed yet
          </p>
          <p className="text-sm text-muted-foreground/80">
            Businesses will appear here as they join Hopping Deals.
          </p>
        </div>
      );
    }

    if (view === "map") {
      return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* The map stays visible with no matches so the radius circle shows. */}
          <div ref={mapPanelRef} className="scroll-mt-4 lg:order-2">
            <BusinessDirectoryMap
              businesses={mappable}
              selectedId={selectedId}
              onSelect={handleMapSelect}
              searchArea={searchArea}
              className="h-[420px] sm:h-[480px] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-h-[820px]"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="lg:order-1">{renderNoMatches()}</div>
          ) : (
            <ul className="space-y-3 lg:order-1" aria-label="Businesses">
              {filtered.map((business) => {
                const onMap = isMappable(business);
                const selected = business.id === selectedId;
                return (
                  <li
                    key={business.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(business.id, el);
                      else cardRefs.current.delete(business.id);
                    }}
                    className={`flex items-center gap-2 rounded-2xl border bg-card p-4 shadow-sm transition-all ${
                      selected
                        ? "border-primary/70 ring-2 ring-ring/30"
                        : "border-border hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCardSelect(business)}
                      aria-pressed={onMap ? selected : undefined}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                      <BusinessLogo name={business.name} logoUrl={business.logoUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate font-bold text-foreground">
                            {business.name}
                          </p>
                          <DistanceTag business={business} />
                        </div>
                        <p className="text-xs capitalize text-muted-foreground">
                          {business.businessType || "Business"}
                        </p>
                        {business.businessAddress && (
                          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{business.businessAddress}</span>
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">
                            <Gift className="h-3.5 w-3.5" />
                            {formatPromotions(business.activePromotions)}
                          </span>
                          {!onMap && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              <MapPinOff className="h-3 w-3" />
                              Not on map
                            </span>
                          )}
                          {getCategories(business)
                            .slice(0, 2)
                            .map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                {formatCategoryLabel(cat)}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </button>
                    <Link
                      href={`/business/${business.id}`}
                      aria-label={`View ${business.name}`}
                      className="shrink-0 rounded-full p-2 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:underline"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }

    if (filtered.length === 0) return renderNoMatches();

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((business) => (
          <button
            key={business.id}
            onClick={() => router.push(`/business/${business.id}`)}
            className="group flex flex-col hd-panel hd-panel-interactive p-6 text-left hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <BusinessLogo name={business.name} logoUrl={business.logoUrl} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">
                    {business.name}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {business.businessType || "Business"}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-all group-hover:translate-x-1 group-hover:underline" />
            </div>

            {business.businessAddress && (
              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{business.businessAddress}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {getCategories(business)
                .slice(0, 3)
                .map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {formatCategoryLabel(cat)}
                  </Badge>
                ))}
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gold">
                <Gift className="h-4 w-4" />
                {formatPromotions(business.activePromotions)}
              </span>
              <DistanceTag business={business} />
            </div>
          </button>
        ))}
      </div>
    );
  };

  const showToolbar = !loading && !loadError && businesses.length > 0;

  return (
    <>
      <Header />

      <div className="min-h-screen flex flex-col">
        <PageHero
          scene="directory"
          title="Business directory"
          description="Support local. Meet the businesses on Hopping Deals, whether they’re running offers now or getting ready to launch."
          crumbs={[{ label: "Home", href: "/" }, { label: "Business directory" }]}
        />
        <main className="flex-grow px-4 pb-8 sm:px-8">
          <section className="mx-auto -mt-8 max-w-7xl">

            {showToolbar && (
              <>
                <div className="hd-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, address or category"
                      aria-label="Search businesses"
                      className="h-11 w-full rounded-xl border border-input bg-secondary/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>

                  <div className="flex gap-3">
                    {categories.length > 0 && (
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label="Filter by category"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-secondary/60 px-3 text-sm text-foreground focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-ring/30 sm:w-56 sm:flex-none"
                      >
                        <option value="all">All categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {formatCategoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                    )}

                    <div
                      role="group"
                      aria-label="Choose view"
                      className="inline-flex h-11 shrink-0 rounded-xl border border-border bg-secondary/40 p-1"
                    >
                      {VIEW_OPTIONS.map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setView(id)}
                          aria-pressed={view === id}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${
                            view === id
                              ? "bg-secondary text-gold shadow-[inset_0_0_0_1px_hsl(var(--gold)/0.3)]"
                              : "text-muted-foreground hover:text-foreground/85"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <DirectoryLocationPicker
                      center={center}
                      onChange={setCenter}
                      open={pickerOpen}
                      onOpenChange={setPickerOpen}
                    />
                    <select
                      value={radiusMiles ?? "any"}
                      onChange={(e) => handleRadiusChange(e.target.value)}
                      aria-label="Distance"
                      className={`h-10 rounded-xl border bg-secondary/60 px-3 text-sm focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                        radiusActive
                          ? "border-primary/40 font-semibold text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <option value="any">Any distance</option>
                      {RADIUS_OPTIONS_MILES.map((miles) => (
                        <option key={miles} value={miles}>
                          Within {miles} miles
                        </option>
                      ))}
                    </select>
                    {radiusMiles && !center && (
                      <span className="text-xs text-muted-foreground">
                        Set a location to filter by distance
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground sm:ml-auto sm:shrink-0" aria-live="polite">
                    {filtered.length} business{filtered.length === 1 ? "" : "es"}
                    {view === "map" && ` · ${mappable.length} on the map`}
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="ml-3 font-semibold text-primary-light hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </p>
                </div>
              </>
            )}

            <div className={showToolbar ? "mt-6" : "mt-16"}>{renderContent()}</div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CompliskBusinessDirectory;
