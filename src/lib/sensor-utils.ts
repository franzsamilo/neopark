import { UltrasonicDataMessage } from "@/constants/types/parking";

/**
 * Determines if a parking spot is occupied based on ultrasonic sensor distance
 * @param distance - Distance in cm from the ultrasonic sensor
 * @param threshold - Distance threshold in cm (default: 50cm)
 * @returns boolean indicating if the spot is occupied
 */
export function isSpotOccupied(
  distance: number,
  threshold: number = 50
): boolean {
  // If distance is less than threshold, the spot is occupied
  // This assumes the sensor is mounted above the parking spot
  // and measures distance to the ground/vehicle
  return distance < threshold;
}

/**
 * Processes ultrasonic sensor data and returns occupancy status
 * @param data - Ultrasonic sensor data message
 * @param threshold - Distance threshold in cm (default: 50cm)
 * @returns object with processed sensor data
 */
export function processUltrasonicData(
  data: UltrasonicDataMessage,
  threshold: number = 50
) {
  const isOccupied = isSpotOccupied(data.distance, threshold);

  return {
    distance: data.distance,
    deviceId: data.deviceId,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    isOccupied,
    threshold,
  };
}

/**
 * Validates ultrasonic sensor data
 * @param data - Ultrasonic sensor data message
 * @returns boolean indicating if data is valid
 */
export function validateUltrasonicData(data: UltrasonicDataMessage): boolean {
  return (
    data.type === "ultrasonicData" &&
    typeof data.distance === "number" &&
    data.distance >= 0 &&
    data.distance <= 1000 // Reasonable max distance in cm
  );
}

/**
 * Gets the appropriate color for a parking spot based on occupancy
 * @param isOccupied - Whether the spot is occupied
 * @param isActive - Whether the spot is active
 * @returns CSS color class
 */
export function getSpotColor(
  isOccupied: boolean,
  isActive: boolean = true
): string {
  if (!isActive) return "bg-gray-400"; // Inactive spots
  return isOccupied ? "bg-red-500" : "bg-green-500"; // Occupied vs Available
}
