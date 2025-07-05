import React from "react";

interface IoTStatDisplayProps {
  isConnected: boolean;
  lastData: {
    type: string;
    deviceId: string;
    distance: number;
    timestamp: number;
  } | null;
}

export default function IoTStatDisplay(props: IoTStatDisplayProps) {
  const { isConnected, lastData } = props;
  return (
    <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 space-y-4">
      <h2 className="text-xl font-bold text-gray-300">🚀 IoT Client Test</h2>
      <p className="text-gray-300">
        Status:{" "}
        <span className={isConnected ? "text-green-400" : "text-red-400"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </p>
      {lastData ? (
        <div className="space-y-2 text-gray-300">
          <p>
            📏 Latest Distance:{" "}
            <span className="font-mono">{lastData.distance} cm</span>
          </p>
          <p>
            🕒 Timestamp:{" "}
            <span className="font-mono">
              {new Date(lastData.timestamp).toLocaleTimeString()}
            </span>
          </p>
          <p>
            🔧 Device ID: <span className="font-mono">{lastData.deviceId}</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Waiting for available Neopark unit...</p>
      )}
    </div>
  );
}
