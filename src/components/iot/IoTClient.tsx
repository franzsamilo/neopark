"use client";

import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import IoTStatDisplay from "./IoTStatDisplay";
import ParkingDisplayTest from "./ParkingDisplayTest";

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
    <>
      <ParkingDisplayTest
        isParked={
          lastData?.distance != null &&
          lastData.distance > 0 &&
          lastData.distance < 50
        }
      />
      <div className="px-16" />
      <IoTStatDisplay isConnected={isConnected} lastData={lastData} />
    </>
  );
}
