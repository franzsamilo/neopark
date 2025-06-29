"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Car,
  Navigation,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
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
  onNav,
  selectedLot,
}: ParkingSpotsListProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
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
    <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-4 relative">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-white/40 rounded-full"></div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Nearby Parking
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm">
              {isLoading
                ? "Loading..."
                : `${filteredLots.length} locations found`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-blue-100 transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
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
          isExpanded ? "max-h-[90vh] sm:max-h-[80vh]" : "max-h-80 sm:max-h-96"
        } flex flex-col min-h-0`}
      >
        <div
          className="overflow-y-auto max-h-[90vh] min-h-0 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            maxHeight: "90vh",
            minHeight: 0,
            height: "100%",
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db #f3f4f6",
          }}
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
            <div className="space-y-1 p-2">
              {filteredLots.map((lot) => {
                const distance = calculateDistance();
                const estimatedTime = calculateEstimatedTime(distance);
                const isSelected = selectedLot && lot.id === selectedLot.id;

                return (
                  <div
                    key={lot.id}
                    className={`border border-gray-100 rounded-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-400 shadow-lg ring-2 ring-blue-300"
                        : selectedSpot === lot.id
                          ? "bg-blue-50 border-blue-200 shadow-md"
                          : "bg-white hover:bg-gray-50 hover:shadow-sm"
                    } ${isDragging ? "pointer-events-none" : ""}`}
                    onClick={() => {
                      if (!isDragging) {
                        setSelectedSpot(lot.id);
                        onParkingLotSelect?.(lot);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate">
                            {lot.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{lot.address}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs sm:text-sm">
                            <span className="text-gray-500">{distance}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">
                              {estimatedTime}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {lot.availableSpots}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            available
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            {lot.availableSpots} of {lot.totalSpots} spots
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-medium ${getAvailabilityColor(
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
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getAvailabilityColor(
                              lot.availableSpots,
                              lot.totalSpots
                            ).replace("text-", "bg-")}`}
                            style={{
                              width: `${
                                lot.totalSpots > 0
                                  ? (lot.availableSpots / lot.totalSpots) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-blue-500 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNav?.(lot);
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-1.5" />
                          <span className="hidden sm:inline">Navigate</span>
                          <span className="sm:hidden">Nav</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
