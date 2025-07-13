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

      setLayoutElements((prevElements) => {
        let updated = false;
        const newElements = prevElements.map((element) => {
          if (
            element.elementType === LayoutElementType.PARKING_SPACE &&
            (element.properties as Record<string, unknown>)?.deviceId ===
              lastData.deviceId
          ) {
            const props = element.properties as Record<string, unknown>;
            const threshold = (props?.sensorThreshold as number) ?? 50;
            const isOccupied =
              lastData.distance > 0 && lastData.distance < threshold;
            if (props?.isOccupied !== isOccupied) {
              updated = true;
              return {
                ...element,
                properties: {
                  ...props,
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
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden ring-2 ring-blue-100/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display gradient-text-primary tracking-tight flex items-center">
              <Wifi className="w-6 h-6 mr-2 text-blue-500" />
              IoT Device Management
            </h2>
            <p className="text-gray-600 mt-1 font-body">{parkingLot.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 shadow-lg">
            <h3 className="text-lg font-display mb-4 flex items-center">
              <Wifi
                className={`w-5 h-5 mr-2 ${
                  isConnected ? "text-green-500" : "text-red-500"
                }`}
              />
              Available IoT Devices
              <span className="ml-2 text-sm text-gray-500 font-body">
                ({availableDevices.length} devices)
              </span>
            </h3>

            {availableDevices.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-2 font-display">
                  No IoT devices detected
                </p>
                <p className="text-gray-400 text-sm font-body">
                  Make sure your IoT sensors are powered on and connected
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-700 text-sm font-body">
                    <strong>Connection Status:</strong>
                    {isConnected ? "Connected" : "Disconnected"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableDevices.map((deviceId) => (
                  <div
                    key={deviceId}
                    className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <span className="font-mono text-sm font-body">
                        {deviceId}
                      </span>
                      {lastData?.deviceId === deviceId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-brand">
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
                        className={`text-xs px-2 py-1 rounded-full font-brand ${
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

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50 shadow-lg">
            <h3 className="text-lg font-display mb-4">
              Parking Spaces
              <span className="ml-2 text-sm text-gray-500 font-body">
                ({parkingSpaces.length} spaces)
              </span>
            </h3>

            {parkingSpaces.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-2 font-display">
                  No parking spaces found
                </p>
                <p className="text-gray-400 text-sm font-body">
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
                      className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isOccupied ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></div>
                        <span className="font-semibold font-body">
                          {spotId}
                        </span>
                        {currentDeviceId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-brand">
                            IoT: {currentDeviceId}
                          </span>
                        )}
                      </div>
                      <select
                        value={currentDeviceId || ""}
                        onChange={(e) =>
                          handleDeviceAssignment(spotId, e.target.value)
                        }
                        className="border rounded-lg px-3 py-1 text-sm bg-white/90 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">No device</option>
                        {availableDevices
                          .filter(
                            (deviceId) =>
                              !Object.entries(deviceAssignments).some(
                                ([otherSpotId, assignedDeviceId]) =>
                                  otherSpotId !== spotId &&
                                  assignedDeviceId === deviceId
                              ) || deviceId === currentDeviceId
                          )
                          .map((deviceId) => (
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

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100/50 shadow-lg">
          <h4 className="font-display text-blue-800 mb-4">
            Assignment Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-heading text-blue-600">
                {parkingSpaces.length}
              </div>
              <div className="text-blue-700 font-body">Total Spaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading text-green-600">
                {Object.keys(deviceAssignments).length}
              </div>
              <div className="text-green-700 font-body">Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading text-gray-600">
                {parkingSpaces.length - Object.keys(deviceAssignments).length}
              </div>
              <div className="text-gray-700 font-body">Unassigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading text-purple-600">
                {availableDevices.length}
              </div>
              <div className="text-purple-700 font-body">Available Devices</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-body"
          >
            Cancel
          </button>
          <button
            onClick={saveAssignments}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
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
