"use client";

import { useState, useEffect } from "react";
import { MapPin, Car, ChevronUp, ChevronDown, Search } from "lucide-react";
import { ParkingLot } from "@/constants/types/parking";

interface ParkingSpotsListProps {
  searchQuery?: string;
  onParkingLotSelect?: (lot: ParkingLot) => void;
  onNav?: (lot: ParkingLot) => void;
  selectedLot?: ParkingLot | null;
}

export default function ParkingSpotsList({
  searchQuery = "",
  onParkingLotSelect,
  selectedLot,
}: ParkingSpotsListProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadParkingLots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/parking-lot");
        if (response.ok) {
          const lots = await response.json();
          setParkingLots(Array.isArray(lots) ? lots : []);
        }
      } catch (error) {
        console.error("Error loading parking lots:", error);
        setParkingLots([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadParkingLots();

    const interval = setInterval(loadParkingLots, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLots = parkingLots.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityText = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage > 50) return "Many spots available";
    if (percentage > 20) return "Limited spots";
    return "Almost full";
  };

  const calculateDistance = () => {
    return `${(0.5 + Math.random() * 2).toFixed(1)} km`;
  };

  const calculateEstimatedTime = (distance: string) => {
    const distanceNum = parseFloat(distance);
    const timeMinutes = Math.round(distanceNum * 3 + Math.random() * 5);
    return `${timeMinutes} min`;
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 max-w-md mx-auto w-full">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-4 relative">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-white/40 rounded-full"></div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Nearby Parking</h2>
            <p className="text-blue-100 text-xs">
              {isLoading
                ? "Loading..."
                : `${filteredLots.length} locations found`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-blue-100 transition-colors p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label={isExpanded ? "Collapse list" : "Expand list"}
            >
              {isExpanded ? (
                <ChevronDown className="w-6 h-6" />
              ) : (
                <ChevronUp className="w-6 h-6" />
              )}
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-white">
              <Car className="w-5 h-5" />
              <span className="text-sm font-medium">Parking</span>
            </div>
          </div>
        </div>
        {searchQuery && (
          <div className="mt-3 flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-blue-100" />
            <span className="text-blue-100 text-sm">
              Searching: &quot;{searchQuery}&quot;
            </span>
          </div>
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[90vh]" : "max-h-80"
        } flex flex-col min-h-0`}
      >
        <div
          className="overflow-y-auto max-h-[90vh] min-h-0 flex-1 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredLots.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-center px-4">
              <div>
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  No parking lots found
                </p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try a different search term
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filteredLots.map((lot) => {
                const distance = calculateDistance();
                const estimatedTime = calculateEstimatedTime(distance);
                const isSelected = selectedLot && lot.id === selectedLot.id;
                return (
                  <button
                    key={lot.id}
                    className={`w-full text-left border border-gray-100 rounded-2xl transition-all duration-200 cursor-pointer flex items-center px-4 py-3 shadow-sm bg-white hover:bg-blue-50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                      isSelected ? "ring-2 ring-blue-400 bg-blue-50" : ""
                    } ${isDragging ? "pointer-events-none" : ""}`}
                    onClick={() => {
                      if (!isDragging) {
                        onParkingLotSelect?.(lot);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 text-base mb-0 truncate">
                          {lot.name}
                        </h3>
                        <span
                          className={`ml-2 text-xs font-semibold ${getAvailabilityColor(
                            lot.availableSpots,
                            lot.totalSpots
                          )}`}
                        >
                          {lot.availableSpots}/{lot.totalSpots}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <span>{lot.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {distance}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {estimatedTime} away
                        </span>
                        <span
                          className={`ml-2 text-xs font-medium ${getAvailabilityColor(
                            lot.availableSpots,
                            lot.totalSpots
                          )}`}
                        >
                          {getAvailabilityText(
                            lot.availableSpots,
                            lot.totalSpots
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-center">
                      <Car className="w-7 h-7 text-blue-500 mb-1" />
                      <span className="text-xs text-blue-600 font-bold">
                        Go
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
