"use client";
import useWebsocketNeo from "@/hooks/useWebsocketNeo";
import ParkingDisplayTest from "./ParkingDisplayTest";
import IoTStatDisplay from "./IoTStatDisplay";
export default function IoTClient() {
  const { isConnected, lastData } = useWebsocketNeo();

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
