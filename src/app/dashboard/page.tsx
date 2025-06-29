"use client";

import { useState, useCallback } from "react";
import { Car, Search } from "lucide-react";
import ParkingSpotsList from "@/components/dashboard/ParkingSpotsList";
import Map from "@/components/dashboard/Map";
import LayoutPreview from "@/components/dashboard/LayoutPreview";
import { ParkingLot } from "@/constants/types/parking";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [layoutPreviewLot, setLayoutPreviewLot] = useState<ParkingLot | null>(
    null
  );

  const handleParkingLotSelect = useCallback((lot: ParkingLot) => {
    setSelectedLot(lot);
  }, []);

  const handleViewLayout = useCallback((lot: ParkingLot) => {
    setLayoutPreviewLot(lot);
  }, []);

  const handleCloseLayoutPreview = useCallback(() => {
    setLayoutPreviewLot(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  Neopark
                </h1>
                <p className="text-xs text-gray-600">Find parking near you</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">24</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">8</div>
                <div className="text-xs text-gray-600">Lots</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search for parking lots"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="h-[500px] sm:h-[600px]">
                  <Map
                    searchQuery={searchQuery}
                    onParkingLotSelect={handleParkingLotSelect}
                    onViewLayout={handleViewLayout}
                    selectedLot={selectedLot}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ParkingSpotsList
                searchQuery={searchQuery}
                onParkingLotSelect={handleParkingLotSelect}
                onNav={setSelectedLot}
                selectedLot={selectedLot}
              />
            </div>
          </div>
        </div>
      </div>

      {layoutPreviewLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-8 animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              onClick={handleCloseLayoutPreview}
              aria-label="Close"
            >
              &times;
            </button>
            <LayoutPreview
              parkingLot={layoutPreviewLot}
              onClose={handleCloseLayoutPreview}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}
