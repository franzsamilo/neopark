"use client";

import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

interface UltrasonicData {
  type: string;
  deviceId: string;
  distance: number;
  timestamp: number;
}

interface NewUltrasonicReading {
  type: string;
  data: UltrasonicData;
}

export default function IoTClient() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastData, setLastData] = useState<UltrasonicData | null>(null);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(
      "wss://neopark-websocket.onrender.com"
    );

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket server");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("⚠️ Disconnected from WebSocket server");
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onmessage = (event) => {
      try {
        const response: NewUltrasonicReading = JSON.parse(event.data);
        setLastData(response.data);
        console.log("Received WebSocket data:", response.data);
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 space-y-4">
      <h2 className="text-xl font-bold text-gray-300">
        🚀 IoT Client Dashboard
      </h2>
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
        <p className="text-gray-400">Waiting for data...</p>
      )}
    </div>
  );
}
