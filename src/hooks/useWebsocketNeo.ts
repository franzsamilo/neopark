import {
  NewUltrasonicReading,
  UltrasonicData,
} from "@/constants/types/ultrasonic";
import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export default function useWebsocketNeo() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastData, setLastData] = useState<UltrasonicData | null>(null);
  const [status, setStatus] = useState<string>("Connecting...");

  useEffect(() => {
    let firstAttempt = true;
    const ws = new ReconnectingWebSocket(
      "wss://neopark-websocket.onrender.com"
    );

    ws.onopen = () => {
      setIsConnected(true);
      setStatus("Connected");
      firstAttempt = false;
    };

    ws.onclose = () => {
      setIsConnected(false);
      setStatus(firstAttempt ? "Waking up server..." : "Disconnected");
    };

    ws.onerror = () => {
      setStatus(firstAttempt ? "Waking up server..." : "Connection error");
    };

    ws.onmessage = (event) => {
      try {
        const response: NewUltrasonicReading = JSON.parse(event.data);
        setLastData(response.data);
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, []);
  return { isConnected, lastData, status };
}
