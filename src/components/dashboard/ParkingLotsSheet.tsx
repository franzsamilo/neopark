"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, MapPin, Car } from "lucide-react";
import { ParkingLot } from "@/constants/types/parking";
import { motion, useMotionValue, animate } from "framer-motion";

interface ParkingLotsSheetProps {
  parkingLots: ParkingLot[];
  onLotSelect: (lot: ParkingLot) => void;
  isLoading?: boolean;
}

const SNAP_POINTS = [0.15, 0.5, 0.92]; // collapsed, mid, expanded (percent of viewport height)

export default function ParkingLotsSheet({
  parkingLots,
  onLotSelect,
  isLoading = false,
}: ParkingLotsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [snapIndex, setSnapIndex] = useState(1); // start at mid
  const y = useMotionValue(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Calculate snap positions in px
  const getSnapPositions = () => {
    const vh = viewportHeight || window.innerHeight;
    return SNAP_POINTS.map((p) => vh * (1 - p));
  };

  // Set initial position on mount
  React.useEffect(() => {
    setViewportHeight(window.innerHeight);
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const snapPositions = getSnapPositions();
    y.set(snapPositions[snapIndex]);
  }, [viewportHeight, snapIndex]);

  // Drag logic
  const handleDragEnd = (_e: unknown, info: { point: { y: number } }) => {
    const snapPositions = getSnapPositions();
    const current = info.point.y;
    // Find the closest snap point
    let closest = 0;
    let minDist = Math.abs(current - snapPositions[0]);
    for (let i = 1; i < snapPositions.length; i++) {
      const dist = Math.abs(current - snapPositions[i]);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    setSnapIndex(closest);
    animate(y, snapPositions[closest], {
      type: "spring",
      stiffness: 400,
      damping: 40,
    });
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
    <motion.div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50 touch-pan-y"
      style={{ y }}
      drag="y"
      dragConstraints={{
        top: 0,
        bottom: viewportHeight ? viewportHeight : 1000,
      }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={false}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl border border-blue-100 h-[92vh] flex flex-col">
        <div className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing">
          <div className="w-16 h-1.5 bg-blue-200 rounded-full hover:bg-blue-300 transition-colors duration-200"></div>
        </div>
        <div className="px-6 pb-6 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">Parking Lots</h3>
            </div>
            <button
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200"
              style={{ pointerEvents: "none", opacity: 0.5 }}
              tabIndex={-1}
              aria-hidden="true"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-blue-500 font-medium">
                Loading parking lots...
              </span>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-3">
                {parkingLots.map((lot) => (
                  <button
                    key={lot.id}
                    onClick={() => onLotSelect(lot)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-800">
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
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="truncate">{lot.address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {lot.availableSpots}/{lot.totalSpots} spots
                          </span>
                          <span
                            className={`text-sm font-semibold ${getAvailabilityColor(
                              lot
                            )}`}
                          >
                            {getAvailabilityText(lot)}
                          </span>
                        </div>
                      </div>
                      <Car className="w-6 h-6 text-blue-500 ml-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
