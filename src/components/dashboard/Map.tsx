"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ParkingLot } from "@/constants/types/parking";
import { Compass } from "lucide-react";

interface MapProps {
  searchQuery: string;
  onParkingLotSelect: (lot: ParkingLot) => void;
}

export default function Map({ searchQuery, onParkingLotSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !searchQuery.trim()) return;

    const searchLocation = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [lng, lat] = feature.center;

          map.current?.flyTo({
            center: [lng, lat] as [number, number],
            zoom: 15,
            duration: 2000,
          });
        }
      } catch (error) {
        console.log("Error searching location:", error);
      }
    };

    searchLocation();
  }, [searchQuery]);

  const loadParkingLots = () => {
    const lots: ParkingLot[] = [];
    setParkingLots(lots);
    addParkingLotMarkers(lots);
  };

  const addParkingLotMarkers = (lots: ParkingLot[]) => {
    if (!map.current) return;

    const existingMarkers = document.querySelectorAll(".parking-lot-marker");
    existingMarkers.forEach((marker) => marker.remove());

    lots.forEach((lot) => {
      const markerEl = document.createElement("div");
      markerEl.className = "parking-lot-marker";

      const availabilityPercentage =
        lot.totalSpots > 0 ? (lot.availableSpots / lot.totalSpots) * 100 : 0;
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
            <span class="text-xs font-bold text-gray-800">${lot.availableSpots}</span>
          </div>
          <div class="absolute inset-0 ${pulseColor} rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        className: "custom-popup",
      }).setHTML(`
        <div class="p-5 min-w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800 mb-2">${lot.name}</h3>
              <div class="flex items-center text-gray-600 mb-3">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-sm">${lot.address}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-xl font-bold text-green-600">${
                  lot.availableSpots
                }</div>
                <div class="text-xs text-gray-600 font-medium">Available</div>
              </div>
              <div>
                <div class="text-xl font-bold text-gray-800">${
                  lot.totalSpots
                }</div>
                <div class="text-xs text-gray-600 font-medium">Total Spots</div>
              </div>
            </div>
            
            <!-- Progress bar -->
            <div class="mt-3">
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
          </div>

          <button 
            onclick="window.selectParkingLot('${lot.id}')"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <span>View Details</span>
          </button>
        </div>
      `);

      new mapboxgl.Marker(markerEl)
        .setLngLat([lot.coordinates.lng, lot.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    window.selectParkingLot = (id: string) => {
      const lot = parkingLots.find((l) => l.id === id);
      if (lot) {
        onParkingLotSelect(lot);
      }
    };
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          map.current?.flyTo({
            center: [longitude, latitude] as [number, number],
            zoom: 15,
            duration: 2000,
          });

          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    }
  };

  useEffect(() => {
    if (isMapLoaded && parkingLots.length > 0) {
      addParkingLotMarkers(parkingLots);
    }
  }, [parkingLots, isMapLoaded]);

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
          className="w-12 h-12 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center border border-gray-200"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Compass className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {parkingLots.length}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Parking Lots
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {parkingLots.reduce((sum, lot) => sum + lot.availableSpots, 0)}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Available Spots
            </div>
          </div>
        </div>
      </div>

      {userLocation && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">You are here</span>
          </div>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    selectParkingLot: (id: string) => void;
  }
}
