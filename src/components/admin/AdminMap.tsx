"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { X, Edit, Trash2, MapPin, Plus, Save } from "lucide-react";
import { ParkingLot, NewParkingLotData } from "@/constants/types/parking";
import useWebsocketNeo from "@/hooks/useWebsocketNeo";

interface AdminMapProps {
  onParkingLayoutCreate: (lotId: string) => void;
}

declare global {
  interface Window {
    editParkingLot: (id: string) => void;
    deleteParkingLot: (id: string) => void;
    createParkingLayout: (id: string) => void;
    __tempPinMarker?: mapboxgl.Marker;
  }
}

export default function AdminMap({ onParkingLayoutCreate }: AdminMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const isCreatingLotRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isCreatingLot, setIsCreatingLot] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const [newLotData, setNewLotData] = useState<NewParkingLotData>({
    name: "",
    address: "",
    description: "",
  });
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const { lastData } = useWebsocketNeo();

  useEffect(() => {
    isCreatingLotRef.current = isCreatingLot;
  }, [isCreatingLot]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    let initialCenter: [number, number] = [-74.5, 40];

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initialCenter = [position.coords.longitude, position.coords.latitude];
          if (map.current) {
            map.current.setCenter(initialCenter);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 12,
      antialias: true,
      pitch: 45,
      bearing: 0,
      interactive: true,
    });

    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    });
    map.current.addControl(navControl, "top-left");

    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.current.on("load", async () => {
      setIsMapLoaded(true);
      try {
        const res = await fetch("/api/parking-lot", { method: "GET" });
        const lots = await res.json();
        setParkingLots(Array.isArray(lots) ? lots : []);
        addParkingLotMarkers(Array.isArray(lots) ? lots : []);
      } catch {
        setParkingLots([]);
        addParkingLotMarkers([]);
      }
    });

    map.current.on("click", (e) => {
      if (isCreatingLotRef.current) {
        const { lng, lat } = e.lngLat;
        setClickedLocation({ lat, lng });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
      if (window.__tempPinMarker) {
        window.__tempPinMarker.remove();
        window.__tempPinMarker = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    if (window.__tempPinMarker) {
      window.__tempPinMarker.remove();
      window.__tempPinMarker = undefined;
    }
    if (clickedLocation) {
      const el = document.createElement("div");
      el.className = "temp-pin-marker";
      el.innerHTML = `<div style="width:32px;height:32px;background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:50%;border:4px solid #fff;box-shadow:0 4px 16px #0002;display:flex;align-items:center;justify-content:center;animation:bounce 1s infinite alternate;">
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>`;
      window.__tempPinMarker = new mapboxgl.Marker(el)
        .setLngLat([clickedLocation.lng, clickedLocation.lat])
        .addTo(map.current);
    }
  }, [clickedLocation]);

  const addParkingLotMarkers = (lots: ParkingLot[]) => {
    if (!map.current) return;

    const existingMarkers = document.querySelectorAll(".parking-lot-marker");
    existingMarkers.forEach((marker) => marker.remove());

    lots.forEach((lot) => {
      const markerEl = document.createElement("div");
      markerEl.className = "parking-lot-marker";
      markerEl.innerHTML = `
        <div class="relative group">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-all duration-300 hover:shadow-blue-500/25">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <span class="text-xs font-bold text-white">${lot.availableSpots}</span>
          </div>
          <div class="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
        </div>
      `;
      markerEl.addEventListener("click", () => setSelectedLot(lot));
      new mapboxgl.Marker(markerEl)
        .setLngLat([lot.coordinates.lng, lot.coordinates.lat])
        .addTo(map.current!);
    });

    window.editParkingLot = (id: string) => {
      const lot = parkingLots.find((l) => l.id === id);
      if (lot) {
        setEditingLot(lot);
        setNewLotData({
          name: lot.name,
          address: lot.address,
          description: lot.description || "",
        });
        setClickedLocation(lot.coordinates);
        setIsCreatingLot(true);
      }
    };

    window.deleteParkingLot = (id: string) => {
      if (confirm("Are you sure you want to delete this parking lot?")) {
        setParkingLots((prev) => prev.filter((lot) => lot.id !== id));
      }
    };

    window.createParkingLayout = (id: string) => {
      onParkingLayoutCreate(id);
    };
  };

  const handleCreateLot = async () => {
    if (!newLotData.name || !newLotData.address || !clickedLocation) return;

    try {
      const response = await fetch("/api/parking-lot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLotData.name,
          address: newLotData.address,
          description: newLotData.description,
          coordinates: clickedLocation,
          totalSpots: 0,
          availableSpots: 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to create parking lot");
      const createdLot = await response.json();
      setParkingLots((prev) => [...prev, createdLot]);

      setNewLotData({ name: "", address: "", description: "" });
      setClickedLocation(null);
      setIsCreatingLot(false);
      setEditingLot(null);

      addParkingLotMarkers(
        parkingLots.map((lot) => (lot.id === createdLot.id ? createdLot : lot))
      );
    } catch {}
  };

  const handleUpdateLot = async () => {
    if (
      !editingLot ||
      !newLotData.name ||
      !newLotData.address ||
      !clickedLocation
    )
      return;

    try {
      const updatedLot: ParkingLot = {
        ...editingLot,
        name: newLotData.name,
        address: newLotData.address,
        description: newLotData.description,
        coordinates: clickedLocation,
        updatedAt: new Date(),
      };

      setParkingLots((prev) =>
        prev.map((lot) => (lot.id === editingLot.id ? updatedLot : lot))
      );

      setNewLotData({ name: "", address: "", description: "" });
      setClickedLocation(null);
      setIsCreatingLot(false);
      setEditingLot(null);

      addParkingLotMarkers(
        parkingLots.map((lot) => (lot.id === editingLot.id ? updatedLot : lot))
      );
    } catch {}
  };

  useEffect(() => {
    if (isMapLoaded) {
      addParkingLotMarkers(parkingLots);
    }
  }, [parkingLots, isMapLoaded]);

  useEffect(() => {
    if (!lastData) return;
    setParkingLots((prevLots) => {
      let updated = false;
      const newLots = prevLots.map((lot) => {
        if (!lot.layoutElements || !Array.isArray(lot.layoutElements))
          return lot;
        let lotChanged = false;
        const newLayout = lot.layoutElements.map((el) => {
          if (
            el.elementType === "PARKING_SPACE" &&
            (el.properties as Record<string, unknown>)?.deviceId ===
              lastData.deviceId
          ) {
            const props = el.properties as Record<string, unknown>;
            const threshold = (props?.sensorThreshold as number) ?? 50;
            const isOccupied =
              lastData.distance > 0 && lastData.distance < threshold;
            if (props?.isOccupied !== isOccupied) {
              lotChanged = true;
              updated = true;
              return {
                ...el,
                properties: {
                  ...props,
                  isOccupied,
                  lastDistance: lastData.distance,
                  lastUpdated: lastData.timestamp,
                },
              };
            }
          }
          return el;
        });
        if (lotChanged) {
          const totalSpots = newLayout.filter(
            (e) => e.elementType === "PARKING_SPACE"
          ).length;
          const availableSpots = newLayout.filter(
            (e) =>
              e.elementType === "PARKING_SPACE" &&
              !(e.properties as Record<string, unknown>)?.isOccupied
          ).length;
          return {
            ...lot,
            layoutElements: newLayout,
            totalSpots,
            availableSpots,
          };
        }
        return lot;
      });
      return updated ? newLots : prevLots;
    });
  }, [lastData]);

  return (
    <div className="h-full relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div
        ref={mapContainer}
        className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isCreatingLot ? "cursor-crosshair" : "cursor-grab"
        }`}
      />

      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {clickedLocation && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: `calc(${((clickedLocation.lng + 74.5) / 0.1) * 100}% - 24px)`,
            top: `calc(${((40 - clickedLocation.lat) / 0.1) * 100}% - 48px)`,
          }}
        >
          <div
            className={`w-12 h-12 flex flex-col items-center animate-bounce`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="w-2 h-2 bg-red-300 rounded-full mt-1 shadow-md" />
          </div>
        </div>
      )}

      {isCreatingLot && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-pulse">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Click Mode Active</p>
                <p className="text-blue-100 text-xs">
                  Click anywhere on the map to drop a pin
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreatingLot && (
        <div className="fixed top-8 left-8 z-50 flex items-start justify-start p-0">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xs max-h-[90vh] overflow-y-auto p-4 animate-in slide-in-from-left-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingLot ? "Edit Parking Lot" : "Create Parking Lot"}
                </h3>
                <p className="text-gray-600 mt-1 text-sm">
                  {editingLot
                    ? "Update parking lot information"
                    : "Add a new parking lot to the map"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreatingLot(false);
                  setClickedLocation(null);
                  setEditingLot(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lot Name
                </label>
                <input
                  type="text"
                  value={newLotData.name}
                  onChange={(e) =>
                    setNewLotData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                  placeholder="Enter lot name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newLotData.address}
                  onChange={(e) =>
                    setNewLotData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newLotData.description}
                  onChange={(e) =>
                    setNewLotData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none text-sm"
                  placeholder="Enter description"
                  rows={2}
                />
              </div>

              {clickedLocation && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-800">
                        Location selected!
                      </p>
                      <p className="text-xs text-green-600">
                        {clickedLocation.lat.toFixed(6)},
                        {clickedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={editingLot ? handleUpdateLot : handleCreateLot}
                  disabled={
                    !newLotData.name || !newLotData.address || !clickedLocation
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingLot ? "Update Lot" : "Create Lot"}</span>
                </button>
                <button
                  onClick={() => {
                    setIsCreatingLot(false);
                    setClickedLocation(null);
                    setEditingLot(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreatingLot && (
        <div className="absolute bottom-6 right-6 z-30">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-pulse">
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6" />
              <div>
                <p className="font-semibold">
                  Click on the map to set location
                </p>
                <p className="text-blue-100 text-sm">
                  A pin will drop where you click
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6 z-30">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-6 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-gray-800">Parking Lots</h4>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {parkingLots.length}
            </div>
          </div>
          <div className="space-y-3">
            {parkingLots.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-2">
                  No parking lots yet
                </p>
                <p className="text-gray-400 text-sm">
                  Click the + button to create your first lot
                </p>
              </div>
            ) : (
              parkingLots.map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {lot.name}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {lot.address}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {lot.availableSpots}/{lot.totalSpots} spots
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingLot(lot);
                              setNewLotData({
                                name: lot.name,
                                address: lot.address,
                                description: lot.description || "",
                              });
                              setClickedLocation(lot.coordinates);
                              setIsCreatingLot(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this parking lot?")) {
                                setParkingLots((prev) =>
                                  prev.filter((l) => l.id !== lot.id)
                                );
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-30">
        <button
          onClick={() => setIsCreatingLot(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 p-6 relative animate-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => setSelectedLot(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {selectedLot.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm">{selectedLot.address}</span>
              </div>
              {selectedLot.description && (
                <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                  {selectedLot.description}
                </p>
              )}
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedLot.availableSpots}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Available
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedLot.totalSpots}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedLot.totalSpots > 0
                      ? (
                          (selectedLot.availableSpots /
                            selectedLot.totalSpots) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Capacity
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setEditingLot(selectedLot);
                  setNewLotData({
                    name: selectedLot.name,
                    address: selectedLot.address,
                    description: selectedLot.description || "",
                  });
                  setClickedLocation(selectedLot.coordinates);
                  setIsCreatingLot(true);
                  setSelectedLot(null);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this parking lot?")) {
                    setParkingLots((prev) =>
                      prev.filter((l) => l.id !== selectedLot.id)
                    );
                    setSelectedLot(null);
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => {
                  onParkingLayoutCreate(selectedLot.id);
                  setSelectedLot(null);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Layout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
