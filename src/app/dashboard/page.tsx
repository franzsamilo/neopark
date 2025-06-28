"use client";

import { useState } from "react";
import Map from "@/components/dashboard/Map";
import SearchBar from "@/components/dashboard/SearchBar";
import ParkingLotsSheet from "@/components/dashboard/ParkingLotsSheet";
import { ParkingLot } from "@/constants/types/parking";
import { Car } from "lucide-react";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [parkingLots] = useState<ParkingLot[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleParkingLotSelect = (lot: ParkingLot) => {
    setSelectedLot(lot);
  };

  const handleCloseLotDetails = () => {
    setSelectedLot(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Neopark</h1>
              <p className="text-sm text-gray-600">Find parking near you</p>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="flex-1 relative p-4">
        <div className="h-[calc(100vh-200px)] rounded-3xl overflow-hidden shadow-2xl">
          <Map
            searchQuery={searchQuery}
            onParkingLotSelect={handleParkingLotSelect}
          />
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {parkingLots.length}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Lots Nearby
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {parkingLots.reduce((sum, lot) => sum + lot.availableSpots, 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Available Spots
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Total Spots
              </div>
            </div>
          </div>
        </div>
      </div>

      <ParkingLotsSheet
        parkingLots={parkingLots}
        selectedLot={selectedLot}
        onLotSelect={handleParkingLotSelect}
        onClose={handleCloseLotDetails}
      />
    </div>
  );
}
