"use client";

import { useState, useEffect } from "react";
import { ParkingLot, LayoutElement } from "@/constants/types/parking";
import { LayoutElementType } from "@/constants/enums/parking";
import {
  Car,
  Route,
  AlertTriangle,
  Lightbulb,
  Trees,
  Building,
  Square,
  X,
  RefreshCw,
} from "lucide-react";

interface LayoutPreviewProps {
  parkingLot: ParkingLot;
  onClose: () => void;
}

export default function LayoutPreview({
  parkingLot,
  onClose,
}: LayoutPreviewProps) {
  const [selectedSpot, setSelectedSpot] = useState<LayoutElement | null>(null);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadLayoutData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/parking-lot/${parkingLot.id}/layout`
        );
        if (response.ok) {
          const data = await response.json();
          setLayoutElements(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to load layout data");
          setLayoutElements([]);
        }
      } catch (error) {
        console.error("Error loading layout data:", error);
        setLayoutElements([]);
      } finally {
        setLoading(false);
      }
    };

    loadLayoutData();
  }, [parkingLot.id]);

  const refreshLayout = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/parking-lot/${parkingLot.id}/layout`);
      if (response.ok) {
        const data = await response.json();
        setLayoutElements(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error refreshing layout data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getElementIcon = (type: LayoutElementType) => {
    switch (type) {
      case LayoutElementType.PARKING_SPACE:
        return Car;
      case LayoutElementType.DRIVING_PATH:
        return Route;
      case LayoutElementType.SIGN:
        return AlertTriangle;
      case LayoutElementType.LIGHTING:
        return Lightbulb;
      case LayoutElementType.VEGETATION:
        return Trees;
      case LayoutElementType.BUILDING:
        return Building;
      case LayoutElementType.ENTRANCE:
      case LayoutElementType.EXIT:
        return Square;
      default:
        return Square;
    }
  };

  const getElementColor = (element: LayoutElement) => {
    if (element.elementType === LayoutElementType.PARKING_SPACE) {
      const isOccupied = (element.properties as Record<string, unknown>)
        ?.isOccupied;
      return isOccupied ? "bg-red-500" : "bg-green-500";
    }

    switch (element.elementType) {
      case LayoutElementType.DRIVING_PATH:
        return "bg-gray-500";
      case LayoutElementType.ENTRANCE:
        return "bg-green-600";
      case LayoutElementType.EXIT:
        return "bg-red-600";
      case LayoutElementType.SIGN:
        return "bg-yellow-500";
      case LayoutElementType.LIGHTING:
        return "bg-yellow-400";
      case LayoutElementType.VEGETATION:
        return "bg-green-700";
      case LayoutElementType.BUILDING:
        return "bg-gray-700";
      default:
        return "bg-gray-400";
    }
  };

  const getElementLabel = (element: LayoutElement) => {
    switch (element.elementType) {
      case LayoutElementType.PARKING_SPACE:
        return (
          ((element.properties as Record<string, unknown>)?.spotId as string) ||
          "P"
        );
      case LayoutElementType.DRIVING_PATH:
        return "→";
      case LayoutElementType.ENTRANCE:
        return "IN";
      case LayoutElementType.EXIT:
        return "OUT";
      case LayoutElementType.SIGN:
        return (
          ((element.properties as Record<string, unknown>)?.text as string) ||
          "S"
        );
      case LayoutElementType.LIGHTING:
        return "💡";
      case LayoutElementType.VEGETATION:
        return "🌳";
      case LayoutElementType.BUILDING:
        return "🏢";
      default:
        return "?";
    }
  };

  const parkingSpaces = layoutElements.filter(
    (element) => element.elementType === LayoutElementType.PARKING_SPACE
  );
  const availableSpaces = parkingSpaces.filter(
    (element) => !(element.properties as Record<string, unknown>)?.isOccupied
  );

  const handleSpotClick = (element: LayoutElement) => {
    if (element.elementType === LayoutElementType.PARKING_SPACE) {
      setSelectedSpot(selectedSpot?.id === element.id ? null : element);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading layout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
              {parkingLot.name} - Layout Preview
            </h2>
            <p className="text-gray-600 text-sm sm:text-base truncate">
              {parkingLot.address}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <button
              onClick={refreshLayout}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh layout data"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {availableSpaces.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Available
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800">
                  {parkingSpaces.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total Spots
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {parkingSpaces.length - availableSpaces.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  Occupied
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl mb-6 overflow-auto">
            <div
              className="relative bg-white rounded-lg border-2 border-gray-200 mx-auto"
              style={{
                width: "min(800px, 100%)",
                height: "min(400px, 60vh)",
                minHeight: "300px",
              }}
            >
              {layoutElements.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-base sm:text-lg font-medium">
                      No layout data available
                    </p>
                    <p className="text-xs sm:text-sm">
                      Layout will be available once configured by admin
                    </p>
                  </div>
                </div>
              ) : (
                layoutElements.map((element) => {
                  const Icon = getElementIcon(element.elementType);
                  const isSelected = selectedSpot?.id === element.id;

                  return (
                    <div
                      key={element.id}
                      className={`absolute border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 shadow-lg z-10"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{
                        left: element.position.x,
                        top: element.position.y,
                        width: element.size.width,
                        height: element.size.height,
                        transform: `rotate(${element.rotation}deg)`,
                      }}
                      onClick={() => handleSpotClick(element)}
                    >
                      <div
                        className={`w-full h-full flex items-center justify-center text-white font-bold text-xs ${getElementColor(
                          element
                        )}`}
                      >
                        {element.elementType ===
                        LayoutElementType.PARKING_SPACE ? (
                          <div className="text-center">
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                            <div className="text-xs">
                              {getElementLabel(element)}
                            </div>
                          </div>
                        ) : (
                          <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedSpot &&
            selectedSpot.elementType === LayoutElementType.PARKING_SPACE && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Parking Spot Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spot ID
                    </label>
                    <div className="text-lg font-bold text-gray-800">
                      {((selectedSpot.properties as Record<string, unknown>)
                        ?.spotId as string) || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div
                      className={`text-lg font-bold ${
                        (selectedSpot.properties as Record<string, unknown>)
                          ?.isOccupied
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(selectedSpot.properties as Record<string, unknown>)
                        ?.isOccupied
                        ? "Occupied"
                        : "Available"}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
