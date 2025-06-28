"use client";

import { useState, useEffect } from "react";
import AdminMap from "@/components/admin/AdminMap";
import {
  Settings,
  BarChart3,
  Users,
  Building,
  Plus,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import type { ParkingLot } from "@/constants/types/parking";

export default function AdminPage() {
  const [isCreatingLayout, setIsCreatingLayout] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("map");
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);

  const handleParkingLayoutCreate = (lotId: string) => {
    setSelectedLotId(lotId);
    setIsCreatingLayout(true);
    console.log("Creating parking layout for lot:", lotId);
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

  const handleDeleteLot = async (id: string) => {
    if (!confirm("Delete this parking lot?")) return;
    await fetch(`/api/parking-lot?id=${id}`, { method: "DELETE" });
    setParkingLots((prev) => prev.filter((lot) => lot.id !== id));
  };

  const tabs = [
    { id: "map", label: "Map Management", icon: MapPin },
    { id: "lots", label: "Parking Lots", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage parking lots and layouts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                Desktop Only
              </div>
              <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Parking Lots
                </h2>
              </div>
              {loadingLots ? (
                <div className="text-center py-12 text-gray-500">
                  Loading...
                </div>
              ) : parkingLots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    No parking lots yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Create your first parking lot using the map interface
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parkingLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">
                          {lot.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {lot.address}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {lot.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleParkingLayoutCreate(lot.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm font-semibold"
                        >
                          Layout
                        </button>
                        <button
                          onClick={() => {
                            /* TODO: Edit logic */
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLot(lot.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                onClick={() => {
                  setIsCreatingLayout(false);
                  console.log("Opening layout editor for lot:", selectedLotId);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
              >
                Open Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
