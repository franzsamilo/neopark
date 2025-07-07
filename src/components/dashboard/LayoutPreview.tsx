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
} from "lucide-react";
import useWebsocketNeo from "@/hooks/useWebsocketNeo";
import { motion, AnimatePresence } from "framer-motion";

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

  const { lastData } = useWebsocketNeo();

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

  useEffect(() => {
    if (!lastData) return;
    setLayoutElements((prevElements) => {
      let updated = false;
      const newElements = prevElements.map((element) => {
        if (
          element.elementType === LayoutElementType.PARKING_SPACE &&
          (element.properties as Record<string, unknown>)?.deviceId ===
            lastData.deviceId
        ) {
          const threshold =
            ((element.properties as Record<string, unknown>)
              ?.sensorThreshold as number) || 50;
          const isOccupied =
            lastData.distance > 0 && lastData.distance < threshold;
          if (
            (element.properties as Record<string, unknown>)?.isOccupied !==
            isOccupied
          ) {
            updated = true;
            return {
              ...element,
              properties: {
                ...element.properties,
                isOccupied,
                lastDistance: lastData.distance,
                lastUpdated: lastData.timestamp,
              },
            };
          }
        }
        return element;
      });
      return updated ? newElements : prevElements;
    });
  }, [lastData]);

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

  const handleSpotClick = (element: LayoutElement) => {
    if (element.elementType === LayoutElementType.PARKING_SPACE) {
      setSelectedSpot(selectedSpot?.id === element.id ? null : element);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white/80 rounded-3xl shadow-2xl border border-blue-100 p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className="fixed inset-0 z-50 flex flex-col items-stretch justify-stretch bg-black/40 backdrop-blur-md"
      >
        <div className="relative flex flex-col flex-1 w-full h-full max-w-none max-h-none bg-white/80 backdrop-blur-2xl rounded-none shadow-2xl overflow-hidden border-t border-blue-100">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-2xl font-bold z-10 bg-white/70 rounded-full p-2 shadow-md hover:scale-110 transition-all"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center pt-8 pb-2 px-4">
            <div className="w-12 h-1.5 bg-blue-100 rounded-full mb-4 sm:hidden" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              {parkingLot.name} Layout
            </h2>
            <p className="text-gray-500 text-sm text-center mb-2">
              {parkingLot.address}
            </p>
          </div>
          <div className="relative flex-1 w-full overflow-auto">
            <div className="relative w-full h-full bg-gradient-to-br from-blue-50/80 to-blue-100/80 grid-bg">
              {layoutElements.map((element) => {
                const Icon = getElementIcon(element.elementType);
                const isSelected = selectedSpot?.id === element.id;
                return (
                  <motion.button
                    key={element.id}
                    className={`absolute border-2 transition-all duration-200 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md ${
                      isSelected
                        ? "border-blue-500 z-10 scale-110 bg-white/90 shadow-xl"
                        : "border-gray-200 hover:border-blue-300 bg-white/80"
                    }`}
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
                      transform: `rotate(${element.rotation}deg)`,
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSpotClick(element)}
                  >
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center text-xs font-bold ${getElementColor(
                        element
                      )} rounded-xl`}
                    >
                      {element.elementType ===
                      LayoutElementType.PARKING_SPACE ? (
                        <>
                          <Icon className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-xs font-semibold">
                            {getElementLabel(element)}
                          </span>
                        </>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
              <style jsx>{`
                .grid-bg {
                  background-image: linear-gradient(
                      rgba(59, 130, 246, 0.08) 1px,
                      transparent 1px
                    ),
                    linear-gradient(
                      90deg,
                      rgba(59, 130, 246, 0.08) 1px,
                      transparent 1px
                    );
                  background-size: 20px 20px;
                }
              `}</style>
            </div>
          </div>
          {/* Spot details sheet */}
          <AnimatePresence>
            {selectedSpot && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 right-0 bottom-0 sm:static bg-white/90 rounded-t-3xl sm:rounded-xl shadow-2xl border-t border-blue-100 p-4 z-50 max-w-lg mx-auto"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-blue-700">
                    Spot Details
                  </h3>
                  <button
                    onClick={() => setSelectedSpot(null)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full bg-white/70 shadow-md"
                    aria-label="Close spot details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Spot ID</div>
                    <div className="text-lg font-bold text-gray-800">
                      {((selectedSpot.properties as Record<string, unknown>)
                        ?.spotId as string) || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
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
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Last Distance
                    </div>
                    <div className="text-lg font-mono text-blue-700">
                      {((selectedSpot.properties as Record<string, unknown>)
                        ?.lastDistance as number) ?? "-"}{" "}
                      cm
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Last Updated
                    </div>
                    <div className="text-lg font-mono text-blue-700">
                      {(selectedSpot.properties as Record<string, unknown>)
                        ?.lastUpdated
                        ? new Date(
                            (selectedSpot.properties as Record<string, unknown>)
                              ?.lastUpdated as number
                          ).toLocaleTimeString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
