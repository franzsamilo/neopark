export interface UltrasonicData {
  type: string;
  deviceId: string;
  distance: number;
  timestamp: number;
}

export interface NewUltrasonicReading {
  type: string;
  data: UltrasonicData;
}
