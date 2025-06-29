"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ParkingLot, LayoutElement } from "@/constants/types/parking";
import { Compass } from "lucide-react";

interface MapProps {
  searchQuery: string;
  onParkingLotSelect: (lot: ParkingLot) => void;
  onViewLayout: (lot: ParkingLot) => void;
  selectedLot?: ParkingLot | null;
}

export default function Map({
  searchQuery,
  onParkingLotSelect,
  onViewLayout,
  selectedLot,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Center map on user location if map is loaded
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude] as [number, number],
              zoom: 15,
              duration: 2000,
            });
          }

          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          // Fallback to default location if geolocation fails
          if (map.current) {
            map.current.flyTo({
              center: [-74.5, 40] as [number, number],
              zoom: 12,
              duration: 1000,
            });
          }
        }
      );
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40], // Default center, will be updated when user location is obtained
      zoom: 12,
      antialias: true,
      pitch: 30,
      bearing: 0,
    });

    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    });
    map.current.addControl(navControl, "top-left");

    map.current.on("load", () => {
      setIsMapLoaded(true);
      loadParkingLots();
      // Get user location when map loads
      getCurrentLocation();
    });

    // Add window functions for popup interactions
    (window as Window).selectParkingLot = (id: string) => {
      const lot = parkingLots.find((l) => l.id === id);
      if (lot) {
        onParkingLotSelect(lot);
      }
    };

    (window as Window).viewLayout = (id: string) => {
      const lot = parkingLots.find((l) => l.id === id);
      if (lot) {
        onViewLayout(lot);
      }
    };

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update window functions when callbacks change (but not when parkingLots change)
  useEffect(() => {
    (window as Window).selectParkingLot = (id: string) => {
      const lot = parkingLots.find((l) => l.id === id);
      if (lot) {
        onParkingLotSelect(lot);
      }
    };

    (window as Window).viewLayout = (id: string) => {
      const lot = parkingLots.find((l) => l.id === id);
      if (lot) {
        onViewLayout(lot);
      }
    };
  }, [onParkingLotSelect, onViewLayout, parkingLots]);

  // Polling for real-time updates (every 30 seconds)
  useEffect(() => {
    if (!isMapLoaded) return;

    const interval = setInterval(() => {
      loadParkingLots();
    }, 30000);

    return () => clearInterval(interval);
  }, [isMapLoaded]);

  useEffect(() => {
    if (!map.current || !searchQuery.trim()) return;

    // Search through parking lots in the database instead of using Mapbox geocoding
    const filteredLots = parkingLots.filter(
      (lot) =>
        lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredLots.length > 0) {
      // Center on the first matching parking lot
      const firstLot = filteredLots[0];
      map.current.flyTo({
        center: [firstLot.coordinates.lng, firstLot.coordinates.lat] as [
          number,
          number,
        ],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [searchQuery, parkingLots]);

  const loadParkingLots = async () => {
    try {
      const response = await fetch("/api/parking-lot");
      if (response.ok) {
        const lots = await response.json();
        setParkingLots(Array.isArray(lots) ? lots : []);
        addParkingLotMarkers(Array.isArray(lots) ? lots : []);
      } else {
        console.error("Failed to load parking lots");
        setParkingLots([]);
        addParkingLotMarkers([]);
      }
    } catch (error) {
      console.error("Error loading parking lots:", error);
      setParkingLots([]);
      addParkingLotMarkers([]);
    }
  };

  const addParkingLotMarkers = (lots: ParkingLot[]) => {
    if (!map.current) return;

    const existingMarkers = document.querySelectorAll(".parking-lot-marker");
    existingMarkers.forEach((marker) => marker.remove());

    lots.forEach((lot) => {
      const markerEl = document.createElement("div");
      markerEl.className = "parking-lot-marker";
      markerEl.setAttribute("data-lot-id", lot.id);

      // Calculate dynamic counts from layout data
      let totalSpots = lot.totalSpots;
      let availableSpots = lot.availableSpots;

      // If layout data exists, calculate from layout elements
      if (lot.layoutElements && Array.isArray(lot.layoutElements)) {
        const parkingSpaces = lot.layoutElements.filter(
          (element: LayoutElement) => element.elementType === "PARKING_SPACE"
        );
        totalSpots = parkingSpaces.length;
        availableSpots = parkingSpaces.filter(
          (element: LayoutElement) =>
            !(element.properties as Record<string, unknown>)?.isOccupied
        ).length;
      }

      const availabilityPercentage =
        totalSpots > 0 ? (availableSpots / totalSpots) * 100 : 0;
      let markerColor = "from-red-500 to-red-600";
      let pulseColor = "bg-red-400";

      if (availabilityPercentage > 50) {
        markerColor = "from-green-500 to-green-600";
        pulseColor = "bg-green-400";
      } else if (availabilityPercentage > 20) {
        markerColor = "from-yellow-500 to-yellow-600";
        pulseColor = "bg-yellow-400";
      }

      markerEl.innerHTML = `
        <div class="relative group">
          <div class="w-14 h-14 bg-gradient-to-br ${markerColor} rounded-full border-4 border-white flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-all duration-300 hover:shadow-lg">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div class="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
            <span class="text-xs font-bold text-gray-800">${availableSpots}</span>
          </div>
          <div class="absolute inset-0 ${pulseColor} rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        className: "custom-popup",
      }).setHTML(`
        <div class="p-4 min-w-[260px] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div class="mb-3">
            <h3 class="text-lg font-bold text-gray-900 mb-1 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">${lot.name}</span>
            </h3>
            <div class="flex items-center text-gray-500 text-sm mb-2">
              <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">${lot.address}</span>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div class="text-center flex-1">
              <div class="text-2xl font-bold text-green-600">${availableSpots}</div>
              <div class="text-xs text-gray-600 font-medium">Available</div>
            </div>
            <div class="w-px h-8 bg-gray-200 mx-3"></div>
            <div class="text-center flex-1">
              <div class="text-2xl font-bold text-blue-600">${totalSpots}</div>
              <div class="text-xs text-gray-600 font-medium">Total</div>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>Availability</span>
              <span>${availabilityPercentage.toFixed(0)}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-500 ${
                  availabilityPercentage > 50
                    ? "bg-green-500"
                    : availabilityPercentage > 20
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }"
                style="width: ${availabilityPercentage}%"
              ></div>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 mt-2">
            <button 
              onclick="window.selectParkingLot('${lot.id}')"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-base font-semibold shadow-sm"
            >
              <svg class="w-5 h-5 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Select
            </button>
            ${
              lot.layoutData &&
              Array.isArray(lot.layoutData) &&
              lot.layoutData.length > 0
                ? `
            <button 
              onclick="window.viewLayout('${lot.id}')"
              class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-base font-semibold shadow-sm"
            >
              <svg class="w-5 h-5 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              View Layout
            </button>
            `
                : ""
            }
          </div>
        </div>
      `);

      new mapboxgl.Marker(markerEl)
        .setLngLat([lot.coordinates.lng, lot.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const handleGetCurrentLocation = () => {
    getCurrentLocation();
  };

  // Add a marker for the user's location on the map
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove any existing user location marker
    const existing = document.getElementById("user-location-marker");
    if (existing) existing.remove();

    // Create a custom marker element
    const markerEl = document.createElement("div");
    markerEl.id = "user-location-marker";
    markerEl.style.width = "22px";
    markerEl.style.height = "22px";
    markerEl.style.display = "flex";
    markerEl.style.alignItems = "center";
    markerEl.style.justifyContent = "center";
    markerEl.innerHTML = `
      <div style="width: 14px; height: 14px; background: #ef4444; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 0 8px 2px rgba(239,68,68,0.3); position: relative;">
        <span style="position: absolute; left: 50%; top: 50%; width: 28px; height: 28px; background: rgba(239,68,68,0.2); border-radius: 50%; transform: translate(-50%, -50%); animation: user-pulse 1.2s infinite;"></span>
      </div>
      <style>
        @keyframes user-pulse {
          0% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          70% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
        }
      </style>
    `;

    // Add the marker to the map
    new mapboxgl.Marker(markerEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current!);

    // Clean up on unmount or location change
    return () => {
      markerEl.remove();
    };
  }, [userLocation]);

  // Fly to selectedLot and open its popup
  useEffect(() => {
    if (!map.current || !selectedLot) return;
    map.current.flyTo({
      center: [selectedLot.coordinates.lng, selectedLot.coordinates.lat],
      zoom: 16,
      duration: 1200,
    });
    // Try to open the popup for the selected lot
    setTimeout(() => {
      const marker = document.querySelector(
        `.parking-lot-marker[data-lot-id='${selectedLot.id}']`
      ) as HTMLElement | null;
      if (marker) {
        marker.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    }, 800);
  }, [selectedLot]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
      />

      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 disabled:opacity-50"
          title="Get current location"
        >
          <Compass
            className={`w-5 h-5 text-gray-600 ${
              isLocating ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    selectParkingLot: (id: string) => void;
    viewLayout: (id: string) => void;
  }
}
