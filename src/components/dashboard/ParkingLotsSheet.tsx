"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  Car,
  Navigation,
  Phone,
  Share2,
} from "lucide-react";
import { ParkingLot } from "@/constants/types/parking";

interface ParkingLotsSheetProps {
  parkingLots: ParkingLot[];
  selectedLot: ParkingLot | null;
  onLotSelect: (lot: ParkingLot) => void;
  onClose: () => void;
}

export default function ParkingLotsSheet({
  parkingLots,
  selectedLot,
  onLotSelect,
  onClose,
}: ParkingLotsSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - dragStart;
    setCurrentY(Math.max(0, deltaY));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
    setCurrentY(0);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getAvailabilityColor = (lot: ParkingLot) => {
    const percentage =
      lot.totalSpots > 0 ? (lot.availableSpots / lot.totalSpots) * 100 : 0;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityText = (lot: ParkingLot) => {
    const percentage =
      lot.totalSpots > 0 ? (lot.availableSpots / lot.totalSpots) * 100 : 0;
    if (percentage > 50) return "Good";
    if (percentage > 20) return "Limited";
    return "Full";
  };

  const getAvailabilityBadge = (lot: ParkingLot) => {
    const percentage =
      lot.totalSpots > 0 ? (lot.availableSpots / lot.totalSpots) * 100 : 0;
    if (percentage > 50) return "bg-green-100 text-green-800";
    if (percentage > 20) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl border border-gray-200 transition-all duration-500 ease-out ${
          isExpanded ? "h-[85vh]" : "h-24"
        }`}
        style={{
          transform: `translateY(${currentY}px)`,
        }}
      >
        <div
          className="flex justify-center pt-4 pb-3 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={toggleExpanded}
        >
          <div className="w-16 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors duration-200"></div>
        </div>

        <div className="px-6 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">
                {isExpanded ? "Parking Lots" : "Quick View"}
              </h3>
              {!isExpanded && (
                <p className="text-sm text-gray-600 mt-1">
                  {parkingLots.length} lots available •{" "}
                  {parkingLots.reduce(
                    (sum, lot) => sum + lot.availableSpots,
                    0
                  )}{" "}
                  spots
                </p>
              )}
            </div>
            <button
              onClick={toggleExpanded}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="w-6 h-6" />
              ) : (
                <ChevronUp className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="flex-1 overflow-y-auto">
            {selectedLot ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-2xl font-bold text-gray-800">
                        {selectedLot.name}
                      </h4>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityBadge(
                          selectedLot
                        )}`}
                      >
                        {getAvailabilityText(selectedLot)}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="text-sm">{selectedLot.address}</span>
                    </div>
                    {selectedLot.description && (
                      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {selectedLot.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {selectedLot.availableSpots}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Available
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {selectedLot.totalSpots}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Total Spots
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {(
                          (selectedLot.availableSpots /
                            selectedLot.totalSpots) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Capacity
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">Availability</span>
                      <span className="font-medium">
                        {(
                          (selectedLot.availableSpots /
                            selectedLot.totalSpots) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out"
                        style={{
                          width: `${
                            (selectedLot.availableSpots /
                              selectedLot.totalSpots) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Call</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-3">
                    <Navigation className="w-5 h-5" />
                    <span>Get Directions</span>
                  </button>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-3">
                    <Car className="w-5 h-5" />
                    <span>Reserve Spot</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {parkingLots.map((lot, index) => (
                    <div
                      key={lot.id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-blue-200"
                      onClick={() => onLotSelect(lot)}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-800">
                              {lot.name}
                            </h4>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getAvailabilityBadge(
                                lot
                              )}`}
                            >
                              {getAvailabilityText(lot)}
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-sm">{lot.address}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-sm">
                                <Car className="w-4 h-4 mr-2 text-gray-500" />
                                <span className={getAvailabilityColor(lot)}>
                                  {lot.availableSpots} available
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{getAvailabilityText(lot)}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className={`text-sm font-bold ${getAvailabilityColor(
                                  lot
                                )}`}
                              >
                                {getAvailabilityText(lot)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {lot.totalSpots} total
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {parkingLots.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-2">
                      No parking lots found nearby
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try searching in a different area
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isExpanded && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {parkingLots.reduce(
                      (sum, lot) => sum + lot.availableSpots,
                      0
                    )}{" "}
                    spots available
                  </div>
                  <div className="text-xs text-gray-500">
                    {parkingLots.length} parking lots nearby
                  </div>
                </div>
              </div>
              <div className="text-blue-500 font-semibold text-sm">
                Tap to expand
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
