import {
  NewUltrasonicReading,
  UltrasonicData,
} from "@/constants/types/ultrasonic";
import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export default function useWebsocketNeo() {
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

    return () => {
      ws.close();
    };
  }, []);
  return { isConnected, lastData };
}
