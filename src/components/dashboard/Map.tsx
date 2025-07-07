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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

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
      center: [-74.5, 40],
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
      getCurrentLocation();
    });

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

  useEffect(() => {
    if (!isMapLoaded) return;

    const interval = setInterval(() => {
      loadParkingLots();
    }, 30000);

    return () => clearInterval(interval);
  }, [isMapLoaded]);

  useEffect(() => {
    if (!map.current || !searchQuery.trim()) return;

    const filteredLots = parkingLots.filter(
      (lot) =>
        lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredLots.length > 0) {
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

      let totalSpots = lot.totalSpots;
      let availableSpots = lot.availableSpots;

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
      let statusText = "Almost Full";

      if (availabilityPercentage > 50) {
        markerColor = "from-green-500 to-green-600";
        pulseColor = "bg-green-400";
        statusText = "Many Available";
      } else if (availabilityPercentage > 20) {
        markerColor = "from-yellow-500 to-yellow-600";
        pulseColor = "bg-yellow-400";
        statusText = "Limited";
      }

      markerEl.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="w-16 h-16 bg-gradient-to-br ${markerColor} rounded-full border-4 border-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-lg transform active:scale-95">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
            <span class="text-xs font-bold text-gray-800">${availableSpots}</span>
          </div>
          <div class="absolute inset-0 ${pulseColor} rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        className: "custom-popup",
        closeButton: true,
        closeOnClick: false,
        maxWidth: "320px",
      }).setHTML(`
        <div class="p-4 bg-white rounded-2xl shadow-2xl border border-blue-100">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-gray-900 mb-2 truncate flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">${lot.name}</span>
            </h3>
            <div class="flex items-center text-gray-500 text-sm mb-3">
              <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">${lot.address}</span>
            </div>
          </div>
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-center flex-1">
                <div class="text-2xl font-bold text-green-600">${availableSpots}</div>
                <div class="text-xs text-gray-600 font-medium">Available</div>
              </div>
              <div class="w-px h-8 bg-gray-300 mx-3"></div>
              <div class="text-center flex-1">
                <div class="text-2xl font-bold text-blue-600">${totalSpots}</div>
                <div class="text-xs text-gray-600 font-medium">Total</div>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-600">
              <span>Availability</span>
              <span class="font-semibold">${availabilityPercentage.toFixed(
                0
              )}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
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
            <div class="text-center mt-2">
              <span class="text-xs font-semibold ${
                availabilityPercentage > 50
                  ? "text-green-600"
                  : availabilityPercentage > 20
                    ? "text-yellow-600"
                    : "text-red-600"
              }">${statusText}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <button 
              onclick="window.selectParkingLot('${lot.id}')"
              class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Select Location
            </button>
            ${
              lot.layoutData &&
              Array.isArray(lot.layoutData) &&
              lot.layoutData.length > 0
                ? `
            <button 
              onclick="window.viewLayout('${lot.id}')"
              class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
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

  useEffect(() => {
    if (!map.current || !userLocation) return;

    const existing = document.getElementById("user-location-marker");
    if (existing) existing.remove();

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

    new mapboxgl.Marker(markerEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current!);

    return () => {
      markerEl.remove();
    };
  }, [userLocation]);

  useEffect(() => {
    if (!map.current || !selectedLot) return;
    map.current.flyTo({
      center: [selectedLot.coordinates.lng, selectedLot.coordinates.lat],
      zoom: 16,
      duration: 1200,
    });
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
          className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 disabled:opacity-50 transform hover:scale-105 active:scale-95"
          title="Get current location"
        >
          <Compass
            className={`w-6 h-6 text-blue-600 ${
              isLocating ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 16px !important;
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid #dbeafe !important;
        }
        .mapboxgl-popup-close-button {
          top: 8px !important;
          right: 8px !important;
          font-size: 20px !important;
          color: #6b7280 !important;
          background: white !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid #e5e7eb !important;
        }
        .mapboxgl-popup-close-button:hover {
          background: #f3f4f6 !important;
          color: #374151 !important;
        }
        .mapboxgl-ctrl-group {
          border-radius: 12px !important;
          box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border: 1px solid #e5e7eb !important;
        }
        .mapboxgl-ctrl-group button {
          border-radius: 12px !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}

declare global {
  interface Window {
    selectParkingLot: (id: string) => void;
    viewLayout: (id: string) => void;
  }
}
