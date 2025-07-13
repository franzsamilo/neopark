"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminMap from "@/components/admin/AdminMap";
import IoTDeviceManager from "@/components/admin/IoTDeviceManager";
import {
  Settings,
  BarChart3,
  Users,
  Building,
  Plus,
  MapPin,
  Edit,
  Trash2,
  Wifi,
} from "lucide-react";
import type { ParkingLot } from "@/constants/types/parking";
import useWebsocketNeo from "@/hooks/useWebsocketNeo";

export default function AdminPage() {
  const router = useRouter();
  const [isCreatingLayout, setIsCreatingLayout] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("map");
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);
  const [showIoTManager, setShowIoTManager] = useState(false);
  const [selectedLotForIoT, setSelectedLotForIoT] = useState<ParkingLot | null>(
    null
  );
  const { lastData } = useWebsocketNeo();

  const handleParkingLayoutCreate = (lotId: string) => {
    setSelectedLotId(lotId);
    setIsCreatingLayout(true);
    console.log("Creating parking layout for lot:", lotId);
  };

  const handleOpenLayoutEditor = () => {
    if (selectedLotId) {
      setIsCreatingLayout(false);
      router.push(`/createParkingLayout?id=${selectedLotId}`);
    }
  };

  const handleOpenIoTManager = (lot: ParkingLot) => {
    setSelectedLotForIoT(lot);
    setShowIoTManager(true);
  };

  const handleCloseIoTManager = () => {
    setShowIoTManager(false);
    setSelectedLotForIoT(null);
  };

  useEffect(() => {
    if (activeTab === "lots") {
      setLoadingLots(true);
      fetch("/api/parking-lot", { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          setParkingLots(Array.isArray(data) ? data : []);
        })
        .finally(() => setLoadingLots(false));
    }
  }, [activeTab]);

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

  const handleDeleteLot = async (id: string) => {
    if (!confirm("Delete this parking lot?")) return;
    await fetch(`/api/parking-lot?id=${id}`, { method: "DELETE" });
    setParkingLots((prev) => prev.filter((lot) => lot.id !== id));
  };

  const tabs = [
    { id: "map", label: "Map Management", icon: MapPin },
    { id: "lots", label: "Parking Lots", icon: Building },
    { id: "iot", label: "IoT Devices", icon: Wifi },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40 ring-2 ring-blue-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-brand gradient-text-primary tracking-tight drop-shadow-sm">
                  Neopark Admin
                </h1>
                <p className="text-xs text-blue-500 font-body">
                  Manage parking infrastructure
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-heading text-green-600">
                  {parkingLots.length}
                </div>
                <div className="text-xs text-gray-600 font-body">Lots</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-heading text-blue-600">
                  {parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0)}
                </div>
                <div className="text-xs text-gray-600 font-body">
                  Total Spots
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:shadow-md"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-body">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "map" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 h-[calc(100vh-200px)] overflow-hidden">
              <AdminMap onParkingLayoutCreate={handleParkingLayoutCreate} />
            </div>
          )}

          {activeTab === "lots" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display gradient-text-primary tracking-tight">
                    Parking Lots
                  </h2>
                  <p className="text-sm text-gray-600 font-body mt-1">
                    Manage your parking infrastructure
                  </p>
                </div>
              </div>
              {loadingLots ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-4 text-blue-500 font-body">
                    Loading parking lots...
                  </span>
                </div>
              ) : parkingLots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2 font-display">
                    No parking lots yet
                  </p>
                  <p className="text-gray-400 text-sm font-body">
                    Create your first parking lot using the map interface
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parkingLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="relative bg-white/70 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 text-left hover:border-blue-400 hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col gap-3 ring-1 ring-blue-100/20 before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-blue-400 before:to-green-400"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl flex items-center justify-center shadow-md">
                          <Building className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className="font-display text-xl text-blue-900 tracking-tight">
                          {lot.name}
                        </h4>
                        <div className="ml-auto px-3 py-1 rounded-full text-xs font-brand shadow  border bg-green-100 text-green-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          Active
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm font-body mb-1">
                        {lot.address}
                      </div>
                      {lot.description && (
                        <div className="text-gray-400 text-xs font-body mb-2">
                          {lot.description}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-body">
                          <span className="font-bold text-blue-700">
                            {lot.availableSpots}
                          </span>
                          <span className="mx-1 text-gray-400">/</span>
                          <span className="font-bold text-gray-700">
                            {lot.totalSpots}
                          </span>{" "}
                          spots available
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenIoTManager(lot)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-xs font-semibold flex items-center shadow-md transition-all duration-200 hover:scale-105"
                          >
                            <Wifi className="w-3 h-3 mr-1" />
                            IoT
                          </button>
                          <button
                            onClick={() => handleParkingLayoutCreate(lot.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-xs font-semibold shadow-md transition-all duration-200 hover:scale-105"
                          >
                            Layout
                          </button>
                          <button
                            onClick={() => {
                              /* TODO: Edit logic */
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLot(lot.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <span className="absolute right-4 bottom-4 text-blue-400 text-lg font-bold opacity-60">
                        ›
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "iot" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display gradient-text-primary tracking-tight flex items-center">
                    <Wifi className="w-6 h-6 mr-2 text-purple-500" />
                    IoT Device Management
                  </h2>
                  <p className="text-sm text-gray-600 font-body mt-1">
                    Assign and monitor IoT sensors
                  </p>
                </div>
              </div>

              {loadingLots ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-4 text-blue-500 font-body">
                    Loading parking lots...
                  </span>
                </div>
              ) : parkingLots.length === 0 ? (
                <div className="text-center py-12">
                  <Wifi className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2 font-display">
                    No parking lots available
                  </p>
                  <p className="text-gray-400 text-sm font-body">
                    Create parking lots first to manage IoT devices
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parkingLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="relative bg-white/70 backdrop-blur-xl border border-purple-100 rounded-2xl p-6 text-left hover:border-purple-400 hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col gap-3 ring-1 ring-purple-100/20 before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-purple-400 before:to-pink-400"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-300 rounded-xl flex items-center justify-center shadow-md">
                          <Wifi className="w-6 h-6 text-purple-500" />
                        </div>
                        <h4 className="font-display text-xl text-purple-900 tracking-tight">
                          {lot.name}
                        </h4>
                        <div className="ml-auto px-3 py-1 rounded-full text-xs font-brand shadow  border bg-purple-100 text-purple-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                          IoT Ready
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm font-body mb-1">
                        {lot.address}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-body">
                          <span className="font-bold text-purple-700">
                            {lot.totalSpots}
                          </span>{" "}
                          parking spaces available for IoT assignment
                        </span>
                        <button
                          onClick={() => handleOpenIoTManager(lot)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 text-sm font-semibold flex items-center shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <Wifi className="w-4 h-4 mr-2" />
                          Manage IoT Devices
                        </button>
                      </div>
                      <span className="absolute right-4 bottom-4 text-purple-400 text-lg font-bold opacity-60">
                        ›
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                User Management
              </h2>
              <p className="text-gray-600">
                User management interface coming soon...
              </p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Analytics
              </h2>
              <p className="text-gray-600">
                Analytics dashboard coming soon...
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Settings
              </h2>
              <p className="text-gray-600">Admin settings coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {isCreatingLayout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Create Parking Layout
              </h3>
              <p className="text-gray-600">
                Design the perfect parking space layout for your lot
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Layout Editor Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Design parking space layouts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Set individual spot coordinates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Configure spot types and restrictions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Preview the layout before saving</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setIsCreatingLayout(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleOpenLayoutEditor}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
              >
                Open Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {showIoTManager && selectedLotForIoT && (
        <IoTDeviceManager
          parkingLot={selectedLotForIoT}
          onClose={handleCloseIoTManager}
        />
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
