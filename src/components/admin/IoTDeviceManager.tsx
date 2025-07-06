"use client";

import { useState, useEffect } from "react";
import { ParkingLot, LayoutElement } from "@/constants/types/parking";
import { LayoutElementType } from "@/constants/enums/parking";
import useWebsocketNeo from "@/hooks/useWebsocketNeo";
import {
  Wifi,
  Settings,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface IoTDeviceManagerProps {
  parkingLot: ParkingLot;
  onClose: () => void;
}

export default function IoTDeviceManager({
  parkingLot,
  onClose,
}: IoTDeviceManagerProps) {
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [deviceAssignments, setDeviceAssignments] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isConnected, lastData } = useWebsocketNeo();
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(
          `/api/parking-lot/${parkingLot.id}/layout`
        );
        if (response.ok) {
          const elements = await response.json();
          setLayoutElements(elements);

          const assignments: Record<string, string> = {};
          elements.forEach((element: LayoutElement) => {
            if (element.elementType === LayoutElementType.PARKING_SPACE) {
              const deviceId = (element.properties as Record<string, unknown>)
                ?.deviceId as string;
              const spotId = (element.properties as Record<string, unknown>)
                ?.spotId as string;
              if (deviceId && spotId) {
                assignments[spotId] = deviceId;
              }
            }
          });
          setDeviceAssignments(assignments);
        }
      } catch (error) {
        console.error("Error fetching layout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [parkingLot.id]);

  useEffect(() => {
    if (lastData) {
      if (!availableDevices.includes(lastData.deviceId)) {
        setAvailableDevices((prev) => [...prev, lastData.deviceId]);
      }

      const now = Date.now();
      const isActive = now - lastData.timestamp < 30000;
      setDeviceStatus((prev) => ({
        ...prev,
        [lastData.deviceId]: isActive,
      }));
    }
  }, [lastData, availableDevices]);

  const handleDeviceAssignment = (spotId: string, deviceId: string) => {
    if (deviceId === "") {
      const newAssignments = { ...deviceAssignments };
      delete newAssignments[spotId];
      setDeviceAssignments(newAssignments);
    } else {
      setDeviceAssignments((prev) => ({
        ...prev,
        [spotId]: deviceId,
      }));
    }
  };

  const saveAssignments = async () => {
    setSaving(true);
    try {
      const updatedElements = layoutElements.map((element) => {
        if (element.elementType === LayoutElementType.PARKING_SPACE) {
          const spotId = (element.properties as Record<string, unknown>)
            ?.spotId as string;
          const assignedDeviceId = deviceAssignments[spotId];

          return {
            ...element,
            properties: {
              ...element.properties,
              deviceId: assignedDeviceId || null,
            },
          };
        }
        return element;
      });

      const response = await fetch(`/api/parking-lot/${parkingLot.id}/layout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutElements: updatedElements }),
      });

      if (response.ok) {
        setLayoutElements(updatedElements);
        onClose();
      } else {
        throw new Error("Failed to save assignments");
      }
    } catch (error) {
      console.error("Error saving device assignments:", error);
      alert("Failed to save device assignments. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const parkingSpaces = layoutElements.filter(
    (element) => element.elementType === LayoutElementType.PARKING_SPACE
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 max-w-4xl w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading parking layout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Wifi className="w-6 h-6 mr-2 text-blue-500" />
              IoT Device Management
            </h2>
            <p className="text-gray-600 mt-1">{parkingLot.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Available Devices */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Wifi
                className={`w-5 h-5 mr-2 ${
                  isConnected ? "text-green-500" : "text-red-500"
                }`}
              />
              Available IoT Devices
              <span className="ml-2 text-sm text-gray-500">
                ({availableDevices.length} devices)
              </span>
            </h3>

            {availableDevices.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-2">
                  No IoT devices detected
                </p>
                <p className="text-gray-400 text-sm">
                  Make sure your IoT sensors are powered on and connected
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    <strong>Connection Status:</strong>{" "}
                    {isConnected ? "Connected" : "Disconnected"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableDevices.map((deviceId) => (
                  <div
                    key={deviceId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center">
                      <span className="font-mono text-sm">{deviceId}</span>
                      {lastData?.deviceId === deviceId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {deviceStatus[deviceId] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          deviceStatus[deviceId]
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {deviceStatus[deviceId] ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parking Spaces */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">
              Parking Spaces
              <span className="ml-2 text-sm text-gray-500">
                ({parkingSpaces.length} spaces)
              </span>
            </h3>

            {parkingSpaces.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-2">
                  No parking spaces found
                </p>
                <p className="text-gray-400 text-sm">
                  Create a parking layout first to assign IoT devices
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parkingSpaces.map((space) => {
                  const spotId = (space.properties as Record<string, unknown>)
                    ?.spotId as string;
                  const currentDeviceId = deviceAssignments[spotId];
                  const isOccupied = (
                    space.properties as Record<string, unknown>
                  )?.isOccupied as boolean;

                  return (
                    <div
                      key={space.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isOccupied ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></div>
                        <span className="font-semibold">{spotId}</span>
                        {currentDeviceId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            IoT: {currentDeviceId}
                          </span>
                        )}
                      </div>
                      <select
                        value={currentDeviceId || ""}
                        onChange={(e) =>
                          handleDeviceAssignment(spotId, e.target.value)
                        }
                        className="border rounded px-3 py-1 text-sm bg-white"
                      >
                        <option value="">No device</option>
                        {availableDevices.map((deviceId) => (
                          <option key={deviceId} value={deviceId}>
                            {deviceId}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Assignment Summary */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">
            Assignment Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {parkingSpaces.length}
              </div>
              <div className="text-blue-700">Total Spaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(deviceAssignments).length}
              </div>
              <div className="text-green-700">Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {parkingSpaces.length - Object.keys(deviceAssignments).length}
              </div>
              <div className="text-gray-700">Unassigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {availableDevices.length}
              </div>
              <div className="text-purple-700">Available Devices</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveAssignments}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Assignments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
