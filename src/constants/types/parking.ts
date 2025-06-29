import { SpotType, LayoutElementType } from "../enums/parking";

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  description?: string;
  coordinates: { lat: number; lng: number };
  totalSpots: number;
  availableSpots: number;
  isActive: boolean;
  parkingSpots: ParkingSpot[];
  layoutElements: LayoutElement[];
  layoutData?: LayoutElement[] | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParkingSpot {
  id: string;
  spotId: string;
  parkingLotId: string;
  coordinates: { lat: number; lng: number };
  isOccupied: boolean;
  isActive: boolean;
  spotType: SpotType;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutElement {
  id: string;
  parkingLotId: string;
  elementType: LayoutElementType;
  position: Position;
  size: Size;
  rotation: number;
  properties?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NewParkingLotData {
  name: string;
  address: string;
  description: string;
}

export interface LayoutElementData {
  elementType: LayoutElementType;
  position: Position;
  size: Size;
  rotation?: number;
  properties?: Record<string, unknown>;
}

export interface ParkingSpaceProperties {
  spotId?: string;
  spotType?: SpotType;
  isOccupied?: boolean;
  isActive?: boolean;
}

export interface DrivingPathProperties {
  pathType?: "one-way" | "two-way";
  speedLimit?: number;
  direction?: "north" | "south" | "east" | "west";
}

export interface SignProperties {
  signType?: "stop" | "yield" | "speed-limit" | "parking" | "no-parking";
  text?: string;
  color?: string;
}
