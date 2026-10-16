"use client";
import { useEffect, useState } from "react";

type LocationData = {
  city: string | null;
  state: string | null;
  state_code: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string | null;
  source: "browser" | "ip" | "manual";
};

const LOCAL_STORAGE_KEY = "userLocation";

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  const saveToLocalStorage = (loc: LocationData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loc));
  };

  // IP fallback
  const fetchIpLocation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://ipwho.is/`);
      const data = await res.json();

      if (!data.success) throw new Error("IP lookup failed");

      const loc: LocationData = {
        city: data.city || null,
        state: data.region || null,
        state_code: data.region_code || null,
        country: data.country || null,
        lat: data.latitude || null,
        lng: data.longitude || null,
        timezone: data.timezone?.id || null,
        source: "ip",
      };

      setLocation(loc);
      saveToLocalStorage(loc);
    } catch (err) {
      console.error("IP fallback error:", err);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  // Browser geolocation
  const fetchBrowserLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) return fetchIpLocation();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();

          const loc: LocationData = {
            city: data.city || data.locality || null,
            state: data.principalSubdivision || null,
            state_code: data.principalSubdivisionCode || null,
            country: data.countryName || null,
            lat: latitude,
            lng: longitude,
            timezone:
              data.localityInfo?.informative?.find((i: any) =>
                i.description?.toLowerCase()?.includes("time zone"),
              )?.name || null,
            source: "browser",
          };

          setLocation(loc);
          saveToLocalStorage(loc);
          setLoading(false);
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          fetchIpLocation();
        }
      },
      () => fetchIpLocation(), // Permission denied
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (stored) {
      try {
        const loc: LocationData = JSON.parse(stored);
        setLocation(loc);
        setLoading(false);
        return;
      } catch {}
    }

    fetchBrowserLocation();
  }, []);

  return { location, loading };
};
